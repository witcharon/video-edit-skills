# QC

Look at your own frames before showing anything.

1. **Stills sheet:** one still per moment at its key beat, tiled:
   ```sh
   ls out/stills/*.png | sed "s/.*/file '&'/" > out/stills/list.txt
   ffmpeg -f concat -safe 0 -i out/stills/list.txt -vf "scale=640:360,tile=3x4" -frames:v 1 out/sheet.png
   ```
   Check:
   - nothing over the face;
   - type readable at 640 px wide;
   - one caret at a time;
   - accented capitals (İ Ö Ü) clear the line above;
   - nothing overlapping;
   - every word on screen spoken.
2. **Strips around fast moves** (layout glides, cut-aways, flying cards):
   ```sh
   python3 $MS/scripts/qc.py strip <file> --at <s> --n 8 --w 480
   ```
   Blur that shows stepped copies needs more shutter samples: add the stretch to `FAST` and re-render it with `--frames`. Then splice it in.
3. **Frame count and length:** `ffprobe -count_packets` on the render matches `round(SECONDS * 30)`. After `mux.py`, the video may lose one frame to the audio's length; that is fine.
4. **Sync:** cross-correlate the final's audio against the cut's audio at several points. The offset must be constant. Decode both from the start; don't use `-ss` input seeking, because AAC seeks give false ±21 ms offsets.
   ```python
   import subprocess, numpy as np
   pcm = lambda f: np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",f,"-ac","1","-ar","8000","-f","s16le","-"],capture_output=True).stdout, np.int16).astype(float)
   A, B = pcm("final.mp4"), pcm("../preview.mp4")
   for s in (30, 120, 240):
       a, b = A[s*8000:s*8000+32000], B[s*8000:s*8000+32000]
       c = np.correlate(a - a.mean(), (b - b.mean())[400:-400], "valid"); print(s, (np.argmax(c) - 400) / 8, "ms")
   ```
5. **Loudness:** `mux.py` prints integrated LUFS and true peak after the encode. Report them.
6. **Critique:** score the result against the style guide and the reference (motion-studio `references/critique.md`). Fix the worst three, re-render only those stretches, and repeat at most three passes before reporting what is left.
