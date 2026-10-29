import { useCurrentFrame } from "remotion";
import { C, FPS, LOOK, clamp01, font, live, out } from "./theme";

// Type is typed: a word starts on the word it says, letters follow one by one behind a thin caret.
// It never slides in; it leaves with a quick fade.

const useT = () => useCurrentFrame() / FPS;

export type Word = { text: string; at: number };
export const say = (text: string, at: number): Word[] => [{ text, at }];

const CPS = 30; // letters per second, at most
const CARET_HOLD = 0.45; // the caret blinks this long after the last letter

/** When each letter of each word appears: on its word's time, never sooner than 1/CPS after the previous letter. */
const schedule = (words: Word[]) => {
  let prev = -Infinity;
  return words.map((w) => [...w.text].map(() => (prev = Math.max(w.at, prev + 1 / CPS))));
};

/** Only one caret at a time: a line's caret hands over to the line that starts typing next. */
const handover = (lines: Word[][]) => {
  const starts = lines.map((l) => (l.length ? l[0].at : Infinity));
  return starts.map((s) => Math.min(...starts.filter((x) => x > s)));
};

/** Leaves with a quick fade and a little blur, without moving. */
export const fadeOut = (t: number, o: number) => {
  const x = out(t, o, 0.25);
  return { opacity: 1 - x, filter: x > 0 ? `blur(${x * 8}px)` : undefined } satisfies React.CSSProperties;
};

/** Shows at its time (no typing, e.g. a counter) and leaves like typed text. */
export const appear = (t: number, at: number, o: number) => {
  const f = fadeOut(t, o);
  return { ...f, opacity: t >= at ? f.opacity : 0 };
};

const Caret: React.FC<{ t: number; end: number }> = ({ t, end }) => (
  <span
    style={{
      position: "absolute",
      right: "-0.09em",
      top: "0.12em",
      bottom: "0.1em",
      width: "max(2px, 0.045em)",
      borderRadius: 2,
      background: "currentColor",
      opacity: t < end ? 1 : Math.floor((t - end) * 6) % 2 ? 0 : 1,
    }}
  />
);

/** A line typed out on its spoken times. One word can sit in a small box that grows behind it at box.at. */
export const Typed: React.FC<{ words: Word[]; out: number; style?: React.CSSProperties; box?: { text: string; at: number }; caretUntil?: number }> = ({
  words,
  out: o,
  style,
  box,
  caretUntil = Infinity,
}) => {
  const t = useT();
  if (!words.length) return null;
  const times = schedule(words);
  const end = times[times.length - 1].at(-1)!;
  const caretOn = t < Math.min(end + CARET_HOLD, caretUntil);
  let last: [number, number] = [-1, -1];
  times.forEach((ws, i) => ws.forEach((at, j) => (t >= at ? (last = [i, j]) : null)));
  return (
    <div style={{ whiteSpace: "nowrap", ...style, ...fadeOut(t, o) }}>
      {words.map((w, i) => {
        // letters not typed yet keep their place (invisible), so nothing reflows while typing
        const letters = [...w.text].map((ch, j) => (
          <span key={j} style={{ position: "relative", opacity: t >= times[i][j] ? 1 : 0 }}>
            {ch}
            {caretOn && last[0] === i && last[1] === j ? <Caret t={t} end={end} /> : null}
          </span>
        ));
        return (
          <span key={i}>
            {w.text === box?.text ? <BoxWord at={box.at}>{letters}</BoxWord> : letters}
            {i < words.length - 1 ? " " : null}
          </span>
        );
      })}
    </div>
  );
};

/** One word inside a line gets a small box that grows out from its left edge. */
const BoxWord: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const t = useT();
  const eased = 1 - (1 - clamp01((t - at) / 0.22)) ** 3;
  return (
    <span style={{ position: "relative", display: "inline-block", padding: "0 0.18em" }}>
      <span
        style={{
          position: "absolute",
          inset: "0.08em 0 0.02em 0",
          background: C.box,
          borderRadius: "0.12em",
          transformOrigin: "left center",
          transform: `scaleX(${eased})`,
          boxShadow: "0 10px 26px -10px rgba(0,0,0,0.35)",
        }}
      />
      <span style={{ position: "relative", color: C.boxText, textShadow: "none" }}>{children}</span>
    </span>
  );
};

/** Headline: a small line over a big display word, optional small line under it. */
export const Headline: React.FC<{
  over: Word[];
  big: Word;
  under?: Word[];
  out: number;
  x: number;
  y: number;
  size?: number;
}> = ({ over, big, under, out, x, y, size = 190 }) => {
  const t = useT();
  if (!live(t, Math.min(...[...over, big, ...(under ?? [])].map((w) => w.at)), out)) return null;
  const until = handover([over, [big], under ?? []]);
  const ink = { color: C.ink, textShadow: LOOK.shadow.ink };
  const small: React.CSSProperties = { ...font("small", size * 0.3), ...ink, marginLeft: size * 0.04 };
  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      <Typed words={over} out={out} style={small} caretUntil={until[0]} />
      {/* the gap above the big line leaves room for accented capitals (İ, Ö, Ü) */}
      <Typed words={[big]} out={out} caretUntil={until[1]} style={{ ...font("display", size), ...ink, marginTop: size * 0.12 }} />
      {under ? <Typed words={under} out={out} style={{ ...small, marginTop: size * 0.05 }} caretUntil={until[2]} /> : null}
    </div>
  );
};

/** Caption: a small line, then the key words big in the display face; an optional tail line can box one word. `light` = light type over a dark shot. */
export const Caption: React.FC<{
  small: Word[];
  key_: Word[];
  out: number;
  x: number;
  y: number;
  size?: number;
  light?: boolean;
  box?: { text: string; at: number };
  tail?: Word[];
}> = ({ small, key_, out, x, y, size = 120, light, box, tail }) => {
  const t = useT();
  if (!live(t, Math.min(...[...small, ...key_].map((w) => w.at)), out)) return null;
  const until = handover([small, key_, tail ?? []]);
  const ink = light ? { color: C.light, textShadow: LOOK.shadow.light } : { color: C.ink, textShadow: LOOK.shadow.ink };
  const line: React.CSSProperties = { ...font("text", size * 0.36), ...ink };
  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      <Typed words={small} out={out} caretUntil={until[0]} style={line} />
      <Typed words={key_} out={out} caretUntil={until[1]} style={{ ...font("key", size), ...ink, marginTop: size * 0.02 }} />
      {tail ? <Typed words={tail} out={out} box={box} caretUntil={until[2]} style={{ ...line, marginTop: size * 0.12 }} /> : null}
    </div>
  );
};
