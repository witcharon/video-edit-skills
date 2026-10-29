---
name: longform-video-edit
description: Turn a raw long-form or talking-head recording (YouTube video, cafe talk, vlog, tutorial to camera, podcast with video) into a finished edit with a light motion layer. The pipeline cuts silences and retakes, then adds a few motion graphics on the key moments. Candidates are the speaker's product UI, a number they say, a named tool, a comparison, and the hook. Each graphic lands on its spoken word, with typed text, camera layouts (full, punch-in, side card), cut-aways, quiet sound effects and a measured master. Every project gets its own look (style_guide.md built from the brand, a reference or the footage), never a house style. Use it whenever someone hands over a raw recording and wants it edited, wants app visuals / b-roll / titles / motion graphics over a talking head, asks for an "edit layer", a "YouTube edit", "videoyu editle", "ekrana görsel gelsin", or wants an edit redone "in the style of" a reference video or guide. Use it even if they only say "make it less boring". Pairs with video-use (the cut), motion-studio (craft, sound, QC), copywriting (on-screen copy) and Remotion.
---

# Long-form video edit

A raw recording becomes a finished video in two layers:
- **The cut:** silences and retakes out, done with video-use.
- **The edit layer:** a Remotion composition whose frames map 1:1 to the cut. The layer adds motion graphics at a few moments, each tied to a spoken word.

The cut's audio stays the soundtrack, so sync holds by construction. Every frame is a function of time, so any fix is an edit plus a re-render of that stretch, and you can look at any frame you made.

The skill has no house style. How things move and how finished they look is fixed craft:
- Springs and motion blur.
- Text typed letter by letter.
- Double-bezel cards and depth.
- Measured sound.

What the video looks like is decided per project in `style_guide.md` (`references/look.md`).

`SKILL=~/.claude/skills/longform-video-edit`, `MS=~/.claude/skills/motion-studio`.

## Project layout

```
<videos_dir>/edit/                 video-use's folder: edl.json, transcripts/, preview.mp4, project.md
  motion/                          a copy of $SKILL/template (the edit layer)
    style_guide.md, look.json      the look                                  (step 3)
    src/fonts.ts                   the look's fonts                          (step 3)
    src/timeline.ts                every time, each on a spoken word         (step 4)
    src/Scenes.tsx, src/<Product>.tsx   the moments                          (step 6)
    src/shot.ts                    the cut's length and where the face sits
    public/base.mp4                stream copy of the cut; public/… real assets (UI captures, logos, avatar crop)
    audio.py                       voice + effects (+ the user's bed)        (step 9)
    out/stills, out/qc, out/video.mp4, out/score.wav
```

## Pipeline

1. **Cut with video-use.** Follow its rules: describe the strategy in plain words and get it confirmed before touching the cut. A common default: cut silences, keep the last take of anything said twice. The cut's timeline is the edit's timeline.
2. **Words.** `python3 $SKILL/scripts/out_words.py <edit_dir> [from] [to]` prints the cut's sentences with output times. `--json` lists every word. Every time in `timeline.ts` comes from here. Never re-transcribe.
3. **Look** (`references/look.md`).
   - If the project already has a `style_guide.md`, use it and say what this video keeps and changes.
   - Otherwise build a new look, in this order: the brand's own assets, then the user's reference (its grammar, never its content), then the footage itself, then the variance step.
   - Write `style_guide.md`, `look.json` and `src/fonts.ts`.
   - Before building scenes, show one still of the look on a real frame (a headline and a card).
4. **Moments** (`references/moments.md`).
   - Read the whole transcript in sentences.
   - List candidate moments with times, then keep few: the hook and a name card in the first minute; in the body, roughly one every 1–3 minutes, on product and feature mentions, numbers said, comparisons, named tools and the key term of a section.
   - Write a table: time, the spoken words, what appears, layout, when it leaves.
   - For a long video, show the table before building unless the user said to go ahead.
5. **Copy** (`references/copy.md`, plus the copywriting skill when installed). On screen go only words the speaker said or the product's real UI copy. No invented numbers, claims or badges.
6. **Build.**
   - Set up the project: `cp -R $SKILL/template <edit_dir>/motion && cd <edit_dir>/motion && npm i`.
   - Copy the cut in: `ffmpeg -i ../preview.mp4 -c copy -an public/base.mp4`.
   - Set `src/shot.ts`: the cut's length, and the face position measured on a still.
   - Fill `timeline.ts` and the scenes.
   - Rebuild product UI from the real product: its copy, colours, fonts and logos, captured with Claude in Chrome or read from its source. Never invent a screen.
7. **Stills first.**
   - Run `npm run stills -- 12.5 105 …` at every moment's key beats, then contact-sheet them (`ffmpeg … tile`).
   - Critique against the style guide and the reference (motion-studio `references/critique.md`) and fix the worst three before any long render.
   - Check: nothing over the face, readable at phone size, nothing idle, every word on screen spoken.
8. **Render.**
   - `TMPDIR="$PWD/.tmp" npx remotion render src/index.ts Main out/video.mp4 --muted --concurrency=4 --timeout=180000 --hardware-acceleration=if-possible`, in the background. The first seek into a long base video can take over a minute, so keep the raised `--timeout`.
   - Keep `TMPDIR` on the project's disk: Remotion's bundle copies `public/`, base video included, into the temp folder on every run, and a small system disk fills up mid-render ("Failed to fetch … disk space is low").
   - For a long-video preview, add `--scale=0.75` (1440×810). The scale must give whole-pixel sizes: `0.6667` fails on 1080 (720.036).
   - Motion blur renders only while something moves (the timeline's windows). Stretches listed in `FAST` get 14 shutter samples.
   - To fix a stretch, re-render it with `--frames=a-b` and splice it in: `python3 $MS/scripts/splice.py out/video.mp4 out/video_b.mp4 out/patch.mp4@<start_s>`.
9. **Sound.**
   - Extract the voice: `ffmpeg -i ../preview.mp4 -vn -ac 2 -ar 48000 out/voice.wav`.
   - Build the score: `python3 audio.py out/voice.wav out/score.wav [bed.mp3]`.
   - Effects go only on visible events, cued 0.03 s early, pitch-varied, and panned to where the event is.
   - The effects bus defaults to `SFX_GAIN = 0.5`. Users found the first mixes too loud, so raise it only on request.
   - A music bed is only a track the user chose, about 26 dB under the voice.
10. **Master:** `python3 $MS/scripts/mux.py out/video.mp4 out/score.wav <final>.mp4 --lufs -14 --tp -1.5`. It verifies loudness after the AAC encode.
11. **QC** (`references/qc.md`): strips around the fast moves, a stills sheet, frame count, and a sync check by cross-correlation against the cut.

## Non-negotiables

- **A new look per project.** Use the project's guide if it has one, otherwise build it from scratch. Never default to the worked example's look or to the last project's look.
- **Every change lands on a spoken word.** Nothing idle: an element enters with its word and leaves when its point is made. Nothing covers the face.
- **Text is typed.** Letter by letter behind a thin caret, one caret at a time, and it leaves with a quick fade. Text never slides in from below.
- **Honest copy.** Only spoken words or the real UI's copy. Write it in its final case (CSS uppercase turns Turkish i into I, not İ).
- **Sync by construction.** Rendered frames map 1:1 to the cut, the audio is the cut's audio, and the video is frozen on the real frame while blur samples move the layer around it.
- **Few moments, real craft.** Springs on everything that moves, motion blur while moving, double-bezel cards, diffuse shadows, one accent.
- **Keep versions.** New files get new names (`…-v2.mp4`). Never overwrite the user's files.

## Delivering

Report in this order:
1. Where the file is and its specs: resolution, length, LUFS, true peak, sync offset.
2. What changed against the previous version.
3. What the user must check by eye or ear. You cannot listen, so say so.
4. Where the source, style guide and README live.
5. The skills used.
