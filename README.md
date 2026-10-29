# video-edit-skills

Claude Code skills that turn a raw talking-head or long-form recording into a finished video:
- **Cut:** silences and retakes out.
- **Motion layer:** a light layer on the few moments that need a picture (the hook, the speaker's product UI, a number they say, a comparison, a named tool), each landing on its spoken word.
- **Sound and master:** quiet sound effects on visible events, mastered to −14 LUFS.

Every project gets its own look. When a project has no `style_guide.md`, the skill builds one from scratch, from:
- the brand's own colours and fonts;
- a reference you give;
- the footage itself;
- a variance step over type systems, palettes, grounds and carriers.

The template won't build without it, so two people using this repo don't end up with the same design.

## What's inside

| skill | what it does |
|---|---|
| [`longform-video-edit`](skills/longform-video-edit/SKILL.md) | The pipeline, cut → words → look → moments → copy → Remotion layer → stills → render → sound → master → QC. Includes a Remotion 4 template ([`template/`](skills/longform-video-edit/template)), the look engine, the scene catalog and the word-timing script. |
| [`motion-studio`](skills/motion-studio/SKILL.md) | The craft underneath: springs, motion blur, critique loop, the synthesized sound kit (`audio_kit.py`), mastering (`mux.py`, −14/−15 LUFS with a true-peak limiter), `qc.py` and `splice.py`. |

Defaults worth knowing:
- **Typed text:** letter by letter behind a thin caret, one caret at a time. Text never slides in.
- **Quiet effects:** `SFX_GAIN = 0.5`. Raise it if you want them louder.
- **Music only on request:** a bed is a track you choose, about 26 dB under the voice.
- **Honest copy:** on screen goes only what the speaker said or what the product's UI really shows.

## Install

```sh
git clone https://github.com/witcharon/video-edit-skills
cp -R video-edit-skills/skills/* ~/.claude/skills/
```

Other skills this pipeline uses (install them from their authors):

| skill | from | install |
|---|---|---|
| video-use (the cut, transcription) | [browser-use/video-use](https://github.com/browser-use/video-use) (MIT) | follow its README: clone, `ln -sfn <clone> ~/.claude/skills/video-use`, `uv sync`, ElevenLabs API key |
| copywriting (on-screen copy) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) (MIT) | `npx skills add coreyhaines31/marketingskills --skill copywriting` |
| high-end-visual-design (cards, depth, type) | [Leonxlnx/taste-skill-classics](https://github.com/Leonxlnx/taste-skill-classics) (MIT) | `npx skills add https://github.com/Leonxlnx/taste-skill-classics --skill "high-end-visual-design"` |
| Remotion skills | [remotion-dev/skills](https://github.com/remotion-dev/skills) | `npx skills add remotion-dev/skills` |
| Claude in Chrome | built into Claude Code | used to capture the product's real UI |

Tools you need:
- Node 22.6+.
- Python 3.11+ with `numpy scipy pillow opencv-python-headless`.
- ffmpeg.
- The Remotion packages the template's `npm i` installs.

**Remotion licence:** Remotion has its own license. It is free for individuals and companies of up to 3 people; larger teams need a company license ([remotion.pro](https://www.remotion.pro)).

## How a run goes

1. Give Claude the raw recording and say what you want: "edit this", "add app visuals at the important moments", "in the style of this guide".
2. **Cut:** video-use proposes a strategy, you confirm, it cuts.
3. **Look:** the skill reads your brand, your reference and the footage, then writes `style_guide.md`, `look.json` and `src/fonts.ts`, and shows you one still.
4. **Moments:** it lists the moments with their spoken words and times, keeping few.
5. **Build:** it builds them in the template and checks stills before rendering.
6. **Render and master:** it renders (a 1440×810 preview for long videos), adds the sound, masters and checks sync.
7. **Report:** it tells you what was measured and what you should listen to.

## Credits

- `longform-video-edit` and `motion-studio` by Cansın Cengiz, MIT (see `LICENSE`).
- The look step's anti-default rules follow high-end-visual-design by Leonxlnx.
- The copy rules follow copywriting by Corey Haines.
- The cut is done by browser-use's video-use.
- Their code is not included here; install them from the links above.

---

## Türkçe

Ham bir konuşma videosunu (YouTube, kafe sohbeti, kameraya anlatım) bitmiş bir videoya çeviren Claude Code skill'leri:
- **Kesim:** Sessizlikler ve tekrarlar çıkar.
- **Motion katmanı:** Sadece önemli anlara hafif bir katman gelir: hook, ürün arayüzü, söylenen bir rakam, karşılaştırma. Her biri söylendiği kelimeye oturur.
- **Ses:** Görünen olaylarda kısık efektler, -14 LUFS master.

Her projenin kendi görünümü var. Projede `style_guide.md` yoksa skill sıfırdan oluşturur:
- markanın renk ve fontlarından;
- verdiğin referanstan;
- çekimin kendisinden;
- tipografi, palet, zemin ve taşıyıcı seçeneklerinden yaptığı bir çeşitleme adımından.

Bu yüzden repoyu kullanan herkes aynı tasarımla karşılaşmaz.

Varsayılanlar:
- Yazılar alttan kayarak değil, harf harf daktilo gibi gelir.
- Efekt sesleri kısıktır (`SFX_GAIN = 0.5`).
- Müzik sadece senin seçtiğin parçayla eklenir.
- Ekranda sadece videoda söylenenler ya da ürünün gerçek arayüz metni yer alır.

**Kurulum:** Yukarıdaki iki komut. Diğer skill'leri (video-use, copywriting, high-end-visual-design, Remotion) kendi repolarından kur.
