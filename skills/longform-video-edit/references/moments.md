# Moments

The speaker carries the video; the layer only helps at the moments where a picture says it faster than the face. Few, short, each on its word.

## Where

- **First minute:**
  - The hook: a headline from the hook's own words.
  - A name card when the speaker introduces themselves: avatar, name, a typed greeting, topic chips on their words.
- **Body:** roughly one moment every 1–3 minutes, at:
  - the speaker's product or a feature of it (show the real UI);
  - a number they say;
  - a comparison or a yes/no list;
  - a named tool or site;
  - the key term of a section.
- **Skip:**
  - tangents and jokes (the face carries them);
  - anything you would have to invent;
  - two moments within ~15 s of each other unless they are one scene.

Read the whole transcript in sentences (`scripts/out_words.py <edit_dir>`) and list candidates as a table before building:

| time | spoken words | what appears | layout | leaves at |
|---|---|---|---|---|
| 3:12.4 | "our app now brings in about N a month" | app icon, counter 0→N, label | side | 3:24.0 |

## Rules

- **Every change on a word:** an element enters on the word that names it and leaves about 0.3 s after its last related word.
- **Nothing idle:** if nothing new happens for more than ~3 s, the scene is over; let it leave.
- **One thing at a time:** don't reveal two independent things together; stagger them along the speech.
- **Nothing over the face:** measure the face box once on a still (`src/shot.ts`); text lives on the wall beside it.
- **Hidden or motivated layout changes:** a punch-in happens on a cut; a glide to the side layout happens on the word that starts the scene. Overlay cards enter after the camera has settled and leave before it moves back, so blur never ghosts them.
- **Full-screen cut-aways:** enter with a rack-focus (blur 22 px → 0 with opacity) and hide any camera change behind them.

## Scene catalog (worked examples)

All times come from `timeline.ts`; all text uses `Typed` (letter by letter, caret). Components are in `template/src`.

- **Headline** (`Headline`): small line + big display word + optional small line under.
  - Example: over "AI video tools", big "EVERYTHING", under "is about to change", each word on its spoken time.
- **Caption** (`Caption`): small line, then the key words big in the display face, optionally a tail line with one word boxed.
  - Examples: "make it / yourself"; "localisation / people's [habits]".
  - `light` gives light type over a black-and-white punch-in.
- **Name card** (`ProfileCard`): avatar crop from the footage, name, typed greeting, topic chips; one chip may carry an icon. No verified tick unless the account has one.
- **Checklist** (`Checklist`): a question as the title, rows on their spoken items, then the marks stamping ✓ (yes) or ✕ (no) on the verdict word.
- **Counter:** a big number counting up on the spoken number (`appear` + interpolate). A handwritten note next to it ("but churn too") draws its arrow, then types.
- **Phones** (`Phone`): real app screenshots in metal frames, rising on "mobile app".
- **Product UI with a cursor:**
  - Rebuild the product's real screen as components from its live site: its copy, palette, fonts and platform logos, at fixed positions so the `Cursor` can hit each element.
  - The cursor clicks each item on its spoken name, and each clicked card lights up in the accent.
  - Example: a SaaS app's "import from store" screen, clicking each store platform as it is named.
  - The cursor enters just before its first move, never idling.
- **Cut-away** (full screen on the ground): e.g. "let's say a few hundred products".
  - Product photo cards (`PhotoCard`) are pulled in from the left on "pull your products in".
  - The number is typed on its word.
  - On "all of their photos" the cards fly into the product's icon (list that stretch in `FAST`).
- **Connection:** two app icons linked by the carrier stroke on "connect", a dark card typing the real connection URL, example output cards (video, image) on their words.
- **Punch-ins:** `punch` (×1.16 on a cut) for emphasis; `punchGray` (black and white, ×1.24) for one key term with a light caption.
- **Side layout:** the frame glides into a rounded card on the right (`side`); the scene fills the left half on the ground with the carrier behind it.
