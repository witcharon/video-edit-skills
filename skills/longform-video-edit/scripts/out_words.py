#!/usr/bin/env python3
"""The cut's words on the output timeline, from video-use's edl.json and its cached Scribe transcripts.

    python3 out_words.py <edit_dir> [from_s] [to_s]     sentences with their output time, e.g. [2:46.76] Ürünlerinizi içeri çekip…
    python3 out_words.py <edit_dir> --json              every kept word: text, start, end (output seconds), src (source seconds)

A word's output time = its source time − its range's start + the range's offset in the cut. Never re-transcribe for this.
"""
import json
import sys
from pathlib import Path


def output_words(edit_dir: Path) -> list[dict]:
    edl = json.loads((edit_dir / "edl.json").read_text())
    words = {}
    for name, src in edl["sources"].items():
        transcript = json.loads((edit_dir / "transcripts" / f"{Path(src).stem}.json").read_text())
        words[name] = [w for w in transcript["words"] if w["type"] == "word"]
    out, offset = [], 0.0
    for r in edl["ranges"]:
        for w in words[r["source"]]:
            if r["start"] <= w["start"] and w["end"] <= r["end"] + 0.05:
                out.append({"text": w["text"], "start": w["start"] - r["start"] + offset, "end": min(w["end"], r["end"]) - r["start"] + offset, "src": w["start"]})
        offset += r["end"] - r["start"]
    return out


def sentences(words: list[dict], lo: float, hi: float):
    line, t0 = [], None
    for w in words:
        if not lo <= w["start"] < hi:
            continue
        t0 = w["start"] if t0 is None else t0
        line.append(w["text"])
        if w["text"][-1:] in ".?!" or len(line) > 18:
            yield t0, " ".join(line)
            line, t0 = [], None
    if line:
        yield t0, " ".join(line)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    words = output_words(Path(sys.argv[1]))
    if "--json" in sys.argv:
        print(json.dumps(words, ensure_ascii=False, indent=0))
    else:
        lo, hi = (float(a) for a in (sys.argv[2:4] if len(sys.argv) > 3 else (0, 1e9)))
        for t0, text in sentences(words, lo, hi):
            print(f"[{int(t0 // 60)}:{t0 % 60:05.2f}] {text}")
