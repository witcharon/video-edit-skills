"""Score: the cut's voice plus light effects on visible events only. Times come from src/timeline.ts.

    ffmpeg -i ../preview.mp4 -vn -ac 2 -ar 48000 out/voice.wav     # the cut's audio (same range as base.mp4)
    python3 audio.py out/voice.wav out/score.wav [bed.mp3]
    python3 $MOTION_STUDIO/scripts/mux.py out/video.mp4 out/score.wav ../final.mp4 --lufs -14 --tp -1.5

Effects sit on the effects bus at SFX_GAIN; raise it if the user wants them louder. A bed is only a track the user chose.
"""
import json
import os
import subprocess
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).parent
MOTION_STUDIO = Path(os.environ.get("MOTION_STUDIO", Path.home() / ".claude/skills/motion-studio"))
sys.path.insert(0, str(MOTION_STUDIO / "scripts"))
from audio_kit import Kit, load_wav  # noqa: E402

SFX_GAIN = 0.5  # effects bus: half of the first mixes this was tuned on; quiet by default
BED_UNDER_DB = 26  # a bed sits this far under the voice (LUFS)
LEFT, RIGHT = -0.35, 0.35  # pan of events on the left / right half (side scenes put their cards on the left)


def timeline():
    js = 'import("./src/timeline.ts").then(m => console.log(JSON.stringify({T: m.T, CAMERA: m.CAMERA})))'
    out = subprocess.run(["node", "--experimental-strip-types", "--no-warnings", "-e", js], cwd=HERE, capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def effects(kit, T, camera):
    """One line per visible event, cued kit.EARLY before its contact frame, repeats pitch-varied."""
    sfx, e = kit.bus(), kit.EARLY
    tick = lambda at, gain=.1, pan=0.0: sfx.add(kit.tick(kit.vary()), at - e, gain, pan)                      # a card or key word lands
    click = lambda at, gain=.13, pan=0.0: sfx.add(kit.click(pitch=kit.vary(.85, 1.1)), at - e, gain, pan)     # a cursor click, a key
    swoosh = lambda at, gain=.13, pan=0.0, d=.45: sfx.add(kit.whoosh(d, 500, 2600, peak=.7), at - d * .6, gain, pan)  # something travels
    land = lambda at, gain=.2, pan=0.0: sfx.add(kit.thump(f=110, d=.35), at - e, gain, pan)                   # a big display word
    yes = lambda at, pan=0.0: (sfx.add(kit.blip(kit.hz(79), d=.08), at - e, .08, pan), sfx.add(kit.blip(kit.hz(86), d=.14, decay=.04), at + .06 - e, .07, pan))
    no = lambda at, pan=0.0: sfx.add(kit.blip(kit.hz(64), d=.12, decay=.03), at - e, .1, pan)

    for c in camera:  # the frame glides into a card and back; punch-ins on a cut stay silent
        if not c.get("cut"):
            swoosh(c["t"] + .25, d=.6)

    # The project's events, read from T, e.g.:
    #   land(T["hook"]["big"])
    #   for at in T["checks"]["items"]: tick(at, pan=LEFT)
    #   for at in T["checks"]["marks"]: yes(at, LEFT)
    #   for at in T["product"]["clicks"]: click(at, pan=LEFT)
    return sfx


def bed(path, voice, kit):
    """The user's track, BED_UNDER_DB under the voice by RMS (close enough to LUFS for speech vs. music), faded at both ends."""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "2", "-ar", str(kit.SR), "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).reshape(-1, 2).T.astype(np.float64)
    x = np.tile(x, (1, int(np.ceil(kit.N / x.shape[1]))))[:, : kit.N]
    rms = lambda s: np.sqrt((s**2).mean()) + 1e-12
    x *= rms(voice) / rms(x) * 10 ** (-BED_UNDER_DB / 20)
    t = np.arange(kit.N) / kit.SR
    return x * np.minimum(1, t / 1.2) * np.clip((kit.dur - t) / 1.4, 0, 1)


def main():
    voice_path, score_path = sys.argv[1], sys.argv[2]
    tl = timeline()
    probe = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", voice_path], capture_output=True, text=True, check=True)
    kit = Kit(dur=float(probe.stdout))
    voice = np.zeros((2, kit.N))
    v = load_wav(voice_path, kit)[:, : kit.N]
    voice[:, : v.shape[1]] = v
    mix = voice + SFX_GAIN * effects(kit, tl["T"], tl["CAMERA"]).x
    if len(sys.argv) > 3:
        mix += bed(sys.argv[3], voice, kit)
    kit.finish(mix, score_path, fade=.4, headroom=.3)  # headroom .3 keeps the voice unclipped; mux.py sets loudness and true peak


if __name__ == "__main__":
    main()
