import { Img, staticFile, useCurrentFrame } from "remotion";
import { Typed, type Word } from "./Type";
import { C, DARK, FONT, FPS, LOOK, SHADOW, clamp01, font, knock, live, mix, out, sp } from "./theme";

// Physical cards: a translucent outer shell holding an inner core with its own highlight (double bezel),
// diffuse shadows, photo cards with a pill tab, a metal-framed phone and an oversized cursor.

const useT = () => useCurrentFrame() / FPS;
const tint = (pct: number) => `color-mix(in srgb, ${C.cardText} ${pct}%, ${C.card})`; // rows and chips inside a card

export const Shell: React.FC<{ r?: number; children: React.ReactNode; style?: React.CSSProperties; core?: React.CSSProperties }> = ({ r = LOOK.radius, children, style, core }) => (
  <div
    style={{
      padding: 8,
      borderRadius: r,
      background: DARK ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.42)",
      backdropFilter: "blur(18px) saturate(140%)",
      boxShadow: `${SHADOW}, inset 0 0 0 1px rgba(255,255,255,${DARK ? 0.1 : 0.6})`,
      ...style,
    }}
  >
    <div style={{ borderRadius: r - 8, background: C.card, color: C.cardText, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)", overflow: "hidden", ...core }}>{children}</div>
  </div>
);

/** Card entrance on the UI spring (a hair of overshoot), exit accelerating down and out. */
export const cardIn = (t: number, at: number, o: number, rise = 40) => {
  const p = sp(t, at, "ui");
  const x = out(t, o);
  return { opacity: clamp01(p * 1.5) * (1 - x), transform: `translateY(${mix(rise, 0, p) + 40 * x}px) scale(${mix(0.94, 1, p) * mix(1, 0.96, x)})` };
};

export type Topic = { label: string; at: number; icon?: string };

/** The speaker's card on their first appearance: avatar, name, a typed greeting, topic chips on their spoken words. */
export const ProfileCard: React.FC<{ name: string; avatar: string; greeting: Word; topics: Topic[]; at: number; out: number; x?: number; y?: number }> = ({
  name,
  avatar,
  greeting,
  topics,
  at,
  out: o,
  x = 80,
  y = 96,
}) => {
  const t = useT();
  if (!live(t, at, o)) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, ...cardIn(t, at, o) }}>
      <Shell r={40} core={{ padding: "30px 34px 32px", width: 730 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{ width: 124, height: 124, borderRadius: 62, padding: 4, background: `conic-gradient(${C.accent}, ${C.accentDeep}, ${C.accent})` }}>
            <Img src={staticFile(avatar)} style={{ width: 116, height: 116, borderRadius: 58, border: `3px solid ${C.card}`, objectFit: "cover" }} />
          </div>
          <div>
            <div style={{ ...font("text", 54), fontWeight: 800, letterSpacing: "-0.035em" }}>{name}</div>
            <Typed words={[greeting]} out={o} style={{ ...font("small", 44), color: C.muted, marginTop: 2 }} />
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22 }}>
          {topics.map((topic) => (
            <div
              key={topic.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "11px 22px",
                borderRadius: 999,
                background: topic.icon ? C.cardText : tint(7),
                color: topic.icon ? C.card : C.cardText,
                ...font("text", 31),
                fontWeight: 700,
                ...cardIn(t, topic.at, o, 14),
              }}
            >
              {topic.icon ? <Img src={staticFile(topic.icon)} style={{ width: 31, height: 31 }} /> : null}
              {topic.label}
            </div>
          ))}
        </div>
      </Shell>
    </div>
  );
};

export type Row = { label: string; at: number; logo?: string; initial?: string };

/** Checklist card: rows land on their words; each row's mark stamps on its own time. */
export const Checklist: React.FC<{ title: string; sub?: string; at: number; out: number; rows: Row[]; marks: number[]; verdict: "yes" | "no"; x?: number; y?: number }> = ({
  title,
  sub,
  at,
  out: o,
  rows,
  marks,
  verdict,
  x = 80,
  y = 230,
}) => {
  const t = useT();
  if (!live(t, at, o)) return null;
  const tone = verdict === "yes" ? C.yes : C.no;
  return (
    <div style={{ position: "absolute", left: x, top: y, ...cardIn(t, at, o) }}>
      <Shell r={40} core={{ padding: "28px 30px 26px", width: 700 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <div style={font("small", 52)}>{title}</div>
          {sub ? <div style={{ fontFamily: FONT.mono, fontSize: 24, color: C.muted }}>{sub}</div> : null}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 22 }}>
          {rows.map((r, i) => {
            const row = sp(t, r.at, "ui");
            const m = sp(t, marks[i], "snappy");
            const on = m > 0.02;
            return (
              <div
                key={r.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "14px 16px",
                  borderRadius: 22,
                  background: tint(5),
                  opacity: clamp01(row * 1.5),
                  transform: `translateY(${mix(18, 0, row)}px)`,
                }}
              >
                {r.logo ? <Img src={staticFile(r.logo)} style={{ width: 54, height: 54, borderRadius: 14 }} /> : null}
                {r.initial ? (
                  <div style={{ width: 54, height: 54, borderRadius: 14, background: tint(12), display: "grid", placeItems: "center", ...font("text", 26), fontWeight: 800 }}>{r.initial}</div>
                ) : null}
                <div style={{ flex: 1, ...font("text", 34), fontWeight: 700, whiteSpace: "nowrap" }}>{r.label}</div>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    display: "grid",
                    placeItems: "center",
                    background: on ? tone : "transparent",
                    border: on ? "none" : `2px dashed ${C.muted}`,
                    color: "#fff",
                    ...font("text", 28),
                    fontWeight: 800,
                    transform: `scale(${(on ? mix(0.4, 1, m) : 1) * (1 + 0.18 * knock(t, marks[i], 0.24))})`,
                    boxShadow: on ? `0 10px 22px -8px ${tone}` : undefined,
                  }}
                >
                  {on ? (verdict === "yes" ? "✓" : "✕") : ""}
                </div>
              </div>
            );
          })}
        </div>
      </Shell>
    </div>
  );
};

/** A photo in a thin frame with a pill tab on its top edge. `children` replaces the image (e.g. a video). */
export const PhotoCard: React.FC<{ src: string; label: string; w: number; h: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ src, label, w, h, style, children }) => (
  <div style={{ position: "absolute", width: w, height: h, padding: 7, borderRadius: 26, background: C.card, boxShadow: SHADOW, ...style }}>
    <div style={{ width: "100%", height: "100%", borderRadius: 20, overflow: "hidden", background: tint(10) }}>
      {children ?? <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
    </div>
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: -16,
        transform: "translateX(-50%)",
        padding: "6px 16px",
        borderRadius: 999,
        background: C.card,
        color: C.cardText,
        ...font("text", Math.max(18, w * 0.07)),
        fontWeight: 700,
        whiteSpace: "nowrap",
        boxShadow: "0 6px 16px -6px rgba(0,0,0,0.25)",
      }}
    >
      {label}
    </div>
  </div>
);

/** A phone with a metal frame, glass highlight and a contact shadow. */
export const Phone: React.FC<{ src: string; height: number; style?: React.CSSProperties }> = ({ src, height, style }) => {
  const w = height * 0.47;
  const r = height * 0.09;
  return (
    <div style={{ position: "absolute", width: w, height, ...style }}>
      <div style={{ position: "absolute", left: "8%", right: "8%", bottom: -height * 0.035, height: height * 0.05, borderRadius: "50%", background: "rgba(10,14,8,0.35)", filter: "blur(18px)" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: r,
          padding: height * 0.014,
          background: "linear-gradient(145deg, #5b5f64 0%, #23262a 30%, #0e0f11 60%, #3b3f44 100%)",
          boxShadow: "0 50px 100px -30px rgba(10,14,4,0.55), inset 0 0 0 1.5px rgba(255,255,255,0.18)",
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: r - height * 0.014, overflow: "hidden", background: "#000" }}>
          <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 32%)" }} />
        </div>
      </div>
    </div>
  );
};

/** Oversized pointer gliding between targets on a spring; a click squashes it and rings the target. Enter it just before its first move. */
export const Cursor: React.FC<{ path: { x: number; y: number; at: number }[]; enterAt: number; out: number; from: { x: number; y: number } }> = ({ path, enterAt, out: o, from }) => {
  const t = useT();
  if (!live(t, enterAt, o)) return null;
  let x = from.x;
  let y = from.y;
  let prev = from;
  for (const p of path) {
    if (t < p.at - 0.42) break;
    const move = sp(t, p.at - 0.42, "base");
    x = mix(prev.x, p.x, move);
    y = mix(prev.y, p.y, move);
    prev = p;
  }
  const click = Math.max(...path.map((p) => knock(t, p.at, 0.16)));
  const vis = clamp01(sp(t, enterAt, "ui") * 1.5) * (1 - out(t, o, 0.2));
  return (
    <>
      {path.map((p) => {
        const r = clamp01((t - p.at) / 0.45);
        return r > 0 && r < 1 ? (
          <div
            key={p.at}
            style={{ position: "absolute", left: p.x - 50, top: p.y - 50, width: 100, height: 100, borderRadius: 50, border: `4px solid ${C.accent}`, transform: `scale(${0.3 + 1.2 * r})`, opacity: (1 - r) * vis }}
          />
        ) : null;
      })}
      <svg width={64} height={78} viewBox="0 0 32 39" style={{ position: "absolute", left: x - 6, top: y - 4, opacity: vis, transform: `scale(${1 - 0.14 * click})`, transformOrigin: "6px 4px", filter: "drop-shadow(0 10px 14px rgba(0,0,0,0.35))" }}>
        <path d="M3 2 L3 30 L10 24 L15 36 L20 34 L15 22.5 L25 22.5 Z" fill="#fff" stroke="#0b0c0e" strokeWidth={2.2} strokeLinejoin="round" />
      </svg>
    </>
  );
};
