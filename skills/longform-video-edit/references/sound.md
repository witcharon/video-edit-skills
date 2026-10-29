# Sound

The voice is the film. Effects are quiet punctuation on visible events. A bed is optional and only ever the user's track.

## Layers

- **Voice:** the cut's own audio (`ffmpeg -i ../preview.mp4 -vn -ac 2 -ar 48000 out/voice.wav`). Never re-cut it separately from the picture.
- **Effects:** `template/audio.py` on motion-studio's `audio_kit.py`. One line per visible event:

| event | effect | gain (before SFX_GAIN) |
|---|---|---|
| camera glides into or out of the side card | `swoosh`, d .6 | .13 |
| a cut-away enters or leaves, a card flies | `swoosh` / whoosh up | .12–.16 |
| a card, chip or row lands; a key word starts typing | `tick` (pitch-varied) | .06–.1 |
| a big display word or number | `land` (soft thump) | .18–.2 |
| a cursor click, a typed URL's keys | `click` | .06–.13 |
| ✓ | `yes` (rising pair) | .08 |
| ✕ | `no` (falling blip) | .1 |

Rules for effects:
- Cue each effect `kit.EARLY` (0.03 s) before its contact frame.
- Pan to where the event is: `LEFT` for the left half in side scenes.
- Don't put sound on every typed caption: typing is visual. Key clicks belong only to typed URLs or code.
- Hard punch-ins on a cut stay silent.

- **Effects bus:** `SFX_GAIN = 0.5` by default. Users found the first mixes too loud, so raise it only if the user asks.
- **Bed (optional):** only a track the user chose, about 26 dB under the voice, faded in and out. With no track, ship without a bed and say so.

## Levels

- **`kit.finish(..., headroom=.3)`:** keeps the voice linear. Higher headroom soft-clips speech peaks.
- **`mux.py --lufs -14 --tp -1.5`:** masters with an oversampled true-peak limiter and re-measures after the AAC encode.
- **Report the numbers:** integrated LUFS, true peak, and effect peaks against the voice's RMS. You cannot listen, so say so and ask the user to listen once on headphones.
