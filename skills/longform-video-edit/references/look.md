# The look

Every project gets its own look. Two people using this skill on two videos should not get the same fonts, colours and ground. The template enforces it: it does not build until `look.json` and `src/fonts.ts` exist.

## 1. Inputs, in this order

1. **The project's `style_guide.md`.** If it exists, use it. Say what this video keeps and what it changes, and stop here.
2. **The brand's own assets.**
   - Read the site's CSS or design tokens for colours, fonts and radii.
   - Add the logo, the app's screenshots and the channel's earlier videos and thumbnails.
   - The brand's primary colour is the first candidate for the accent, and the brand's own typefaces come first.
3. **A reference the user gives** (a video, a guide, an account). Extract frames (`ffmpeg -vf fps=2`) and write down its grammar:
   - how text enters and leaves;
   - type pairing and sizes;
   - grounds and depth;
   - carriers and transitions;
   - shot lengths and sound.
   Take the grammar and the craft level, never its content, logos, colours-as-identity or copy.
4. **The footage.** Sample the wall or background behind the speaker and their clothes.
   - Ink must contrast the wall: dark ink with a light halo on light walls, light type with a dark glow on dark walls.
   - The accent must not vanish against the wardrobe.
5. **The variance step** (section 2) decides what the inputs leave open.

## 2. Variance step

Choose one option from each list that fits the brand, the reference and the footage. When two fit equally, break the tie with a seed: `seed = sum of the character codes of the project folder name`, `pick = options[seed % n]`. Write the choices and the reason for each into `style_guide.md`.

**Type system** (display · small line · text · mono). All are in `@remotion/google-fonts`. Check that the family has `latin-ext` when the language needs it (Turkish ş ğ İ).
- Editorial serif: Fraunces / Playfair Display / DM Serif Display / Libre Caslon Display / Instrument Serif · handwriting (Caveat, Kalam, Gochi Hand, Reenie Beanie) · Manrope / DM Sans / Plus Jakarta Sans
- Poster grotesk: Archivo Black / Anton / Bebas Neue / Big Shoulders Display · tracked condensed (Archivo Narrow, Barlow Condensed) · Figtree / Manrope
- Tech: Space Grotesk / Sora / Unbounded · mono small line (JetBrains Mono, IBM Plex Mono, Space Mono) · IBM Plex Sans / Geist
- Soft rounded: Fredoka / Nunito / Baloo 2 · Patrick Hand · Nunito Sans
- Magazine classic: Bodoni Moda / Cormorant Garamond / Prata · the display's italic · Work Sans / Hanken Grotesk
- News condensed: Oswald / Saira Extra Condensed / Barlow Condensed · Permanent Marker · Barlow

**Palette logic** (always exactly one accent):
- one accent on neutrals;
- duotone from two brand colours;
- monochrome plus one signal colour;
- dark mode with a glowing accent.

`yes` and `no` must read on the card colour.

**Ground** (side scenes and cut-aways): `paper` (lit paper, window light, grain), `flat` (solid plus grain), `gradient` (two-stop radial, slow drift), `glass` (dark, soft accent orbs), `grid` (blueprint lines). Light grounds pair with `mode: "light"`; glass needs `"dark"`.

**Carrier** (the stroke behind a scene): `ribbon` (thick 3D band), `marker` (flat highlighter stroke), `line` (thin accent line), `none`.

**Signature move:** pick one that recurs:
- the frame becomes a card on the ground (side layout);
- a black-and-white punch-in for key terms;
- a rack-focus cut-away;
- a boxed word;
- cursor clicks on real UI;
- a ghost word behind the product.

**Never by default:**
- **The worked example's combination:** Instrument Serif caps and italics + Caveat + Plus Jakarta Sans, a lime ribbon on lit paper, white boxed word. Use it only if the user asks for it.
- Inter, Roboto, Arial, Helvetica or Open Sans as display.
- Generic 1px grey borders.
- Harsh dark shadows.
- More than one accent.
- An emoji as an icon.

## 3. Outputs

**`style_guide.md`:**
- source;
- what is taken and what is not;
- palette in hex;
- type roles and sizes;
- space (where text lives, the face's no-go box);
- texture and depth;
- motion, including the signature;
- sound;
- checks.

**`look.json`** (read by `src/theme.ts`). Example shape (not a look to reuse):

```json
{
  "name": "night shift",
  "mode": "dark",
  "palette": { "ink": "#f2f0ea", "light": "#f2f0ea", "ground": "#101216", "groundEdge": "#05060a", "accent": "#7c5cff", "accentDeep": "#4b2fd1",
               "card": "#171a20", "cardText": "#f2f0ea", "muted": "#8a8f99", "box": "#7c5cff", "boxText": "#ffffff", "yes": "#2fc46b", "no": "#e5484d" },
  "shadow": { "ink": "0 2px 24px rgba(0,0,0,0.6)", "light": "0 2px 24px rgba(0,0,0,0.6)" },
  "ground": "glass",
  "carrier": "line",
  "radius": 28,
  "type": { "display": { "weight": 700, "tracking": -0.03, "lineHeight": 0.92 }, "key": { "weight": 500, "italic": false, "tracking": -0.02 },
            "small": { "weight": 400, "tracking": 0.08 }, "text": { "weight": 500, "tracking": -0.01 } }
}
```

What each field means:
- `ink` is type on the footage and the ground; `light` is type over dark shots.
- `shadow.ink` / `shadow.light` are their text-shadows: a soft halo makes type read on a busy wall.
- `display` sets the big words, `key` the caption's key words (display family), `small` the line over or under a headline and card titles, `text` the caption lines and card text.

**`src/fonts.ts`:**

```ts
import { loadFont as loadDisplay } from "@remotion/google-fonts/Unbounded";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadText } from "@remotion/google-fonts/Figtree";

const subsets = ["latin", "latin-ext"] as const;
export const FONT = {
  display: loadDisplay("normal", { weights: ["500", "700"], subsets: [...subsets] }).fontFamily,
  small: loadMono("normal", { weights: ["400"], subsets: [...subsets] }).fontFamily,
  text: loadText("normal", { weights: ["500", "700", "800"], subsets: [...subsets] }).fontFamily,
  mono: loadMono("normal", { weights: ["400"], subsets: [...subsets] }).fontFamily,
};
// if key.italic: loadDisplay("italic", { weights: ["400"], subsets: [...subsets] });
```

A missing weight or style falls back silently. Load exactly the weights `look.json` uses, and look at a still before going on.

## 4. Check the look on a real frame

Render one still with a headline over the footage and one side scene (camera card + a card) before building scenes. Then check:
- Does the type read on the wall at phone size?
- Is the accent the only colour fighting for attention?
- Does it look like the brand rather than like the template?
