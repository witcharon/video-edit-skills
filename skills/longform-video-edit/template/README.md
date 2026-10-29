# Edit-layer template (Remotion 4)

Copy it next to the cut: `cp -R ~/.claude/skills/longform-video-edit/template <edit_dir>/motion && cd <edit_dir>/motion && npm i`.

**It does not build until the look step has written `look.json` and `src/fonts.ts`** (see `../references/look.md`). That is on purpose: every project gets its own look instead of this template's.

| file | what |
|---|---|
| `src/shot.ts` | the cut's length, the video file, where the face sits |
| `src/timeline.ts` | every time on a spoken word, the camera cues, the motion-blur windows |
| `src/Scenes.tsx` | the moments (add product UI in its own file) |
| `src/theme.ts` | the look's values (`look.json`, `fonts.ts`), `font(role, size)`, closed-form springs |
| `src/Type.tsx` | `Typed` (letter by letter, one caret), `Headline`, `Caption`, boxed word, `appear`, `fadeOut` |
| `src/Cards.tsx` | `Shell` (double bezel), `ProfileCard`, `Checklist`, `PhotoCard`, `Phone`, `Cursor` |
| `src/Ground.tsx` | the scene ground, the `Carrier` stroke, `Blur` (180° shutter samples) |
| `src/Camera.tsx` | the shot springing between `full / punch / punchGray / side` |
| `audio.py` | voice + effects (`SFX_GAIN = 0.5`) + optional bed |

```sh
npm run dev                                     # Studio
npm run stills -- 12.5 105                      # check frames → out/stills/
npx remotion render src/index.ts Main out/video.mp4 --muted --concurrency=4 --hardware-acceleration=if-possible   # add --scale=0.6667 for a 720p preview
python3 audio.py out/voice.wav out/score.wav
python3 ~/.claude/skills/motion-studio/scripts/mux.py out/video.mp4 out/score.wav ../final.mp4 --lufs -14 --tp -1.5
```
