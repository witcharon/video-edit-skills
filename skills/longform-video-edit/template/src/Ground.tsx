import { AbsoluteFill, Freeze, useCurrentFrame } from "remotion";
import { C, FPS, LOOK, clamp01, sp } from "./theme";

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

const Grain: React.FC = () => <AbsoluteFill style={{ backgroundImage: GRAIN, opacity: 0.07, mixBlendMode: "multiply" }} />;

/** Paper lit by a window off the top left: soft diagonal light, the frame's shadow bars. The light drifts slowly. */
const Paper: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", inset: -400, transform: `translateX(${((t * 7) % 400) - 200}px) rotate(-28deg)`, filter: "blur(38px)" }}>
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: 300 + i * 520,
          top: 0,
          bottom: 0,
          width: i % 2 ? 140 : 260,
          background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 100%)",
        }}
      />
    ))}
    {[0, 1].map((i) => (
      <div key={`bar${i}`} style={{ position: "absolute", left: 640 + i * 520, top: 0, bottom: 0, width: 46, background: "rgba(40,44,36,0.07)" }} />
    ))}
  </div>
);

/** Two soft orbs of the accent drifting behind dark glass. */
const Glass: React.FC<{ t: number }> = ({ t }) => (
  <>
    {[0, 1].map((i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          left: (i ? 1100 : 100) + 60 * Math.sin(t * 0.07 + i * 2),
          top: (i ? 380 : -260) + 40 * Math.cos(t * 0.05 + i),
          background: i ? C.accentDeep : C.accent,
          opacity: 0.14,
          filter: "blur(160px)",
        }}
      />
    ))}
  </>
);

/** Blueprint grid, drifting a few pixels a second. */
const Grid: React.FC<{ t: number }> = ({ t }) => {
  const line = `color-mix(in srgb, ${C.muted} 22%, transparent)`;
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
        backgroundSize: "64px 64px",
        backgroundPosition: `${(t * 4) % 64}px 0`,
      }}
    />
  );
};

/** The ground of side scenes and cut-aways, as the look says. Never perfectly still. */
export const Ground: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const g = LOOK.ground;
  const at = g === "gradient" ? `${30 + 8 * Math.sin(t * 0.1)}% 20%` : "18% 10%";
  return (
    <AbsoluteFill style={{ background: g === "flat" ? C.ground : `radial-gradient(120% 90% at ${at}, ${C.ground} 0%, ${C.groundEdge} 100%)`, overflow: "hidden" }}>
      {g === "paper" ? <Paper t={t} /> : null}
      {g === "glass" ? <Glass t={t} /> : null}
      {g === "grid" ? <Grid t={t} /> : null}
      <Grain />
    </AbsoluteFill>
  );
};

/**
 * The carrier: a stroke that draws itself in behind a scene and draws off when it leaves.
 * ribbon = a folded 3D band, marker = a flat highlighter stroke, line = a thin accent line, none = nothing.
 */
export const Carrier: React.FC<{ at: number; out: number; d: string; width?: number; style?: React.CSSProperties }> = ({ at, out, d, width = 120, style }) => {
  const t = useCurrentFrame() / FPS;
  const kind = LOOK.carrier;
  if (kind === "none" || t < at - 0.05 || t > out + 0.6) return null;
  const draw = sp(t, at, "heavy");
  const erase = clamp01(sp(t, out, "base"));
  const len = 3000;
  const dash = { strokeDasharray: `${len * (draw - erase)} ${len * 2}`, strokeDashoffset: -len * erase };
  const svg = { position: "absolute", left: 0, top: 0, overflow: "visible", ...style } as const;
  if (kind !== "ribbon") {
    return (
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ ...svg, mixBlendMode: kind === "marker" ? "multiply" : "normal" }}>
        <path d={d} fill="none" stroke={C.accent} strokeWidth={kind === "marker" ? width * 0.7 : 10} strokeLinecap="round" opacity={kind === "marker" ? 0.85 : 1} pathLength={len} style={dash} />
      </svg>
    );
  }
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ ...svg, filter: `drop-shadow(0 40px 46px color-mix(in srgb, ${C.accentDeep} 35%, transparent))` }}>
      <defs>
        <linearGradient id="carrierFace" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`color-mix(in srgb, ${C.accent} 60%, white)`} />
          <stop offset="0.45" stopColor={C.accent} />
          <stop offset="1" stopColor={C.accentDeep} />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke={C.accentDeep} strokeWidth={width} strokeLinecap="round" pathLength={len} style={dash} />
      <path d={d} fill="none" stroke="url(#carrierFace)" strokeWidth={width * 0.8} strokeLinecap="round" pathLength={len} style={{ ...dash, transform: "translate(-6px,-8px)" }} />
      <path d={d} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth={width * 0.12} strokeLinecap="round" pathLength={len} style={{ ...dash, transform: "translate(-14px,-22px)" }} />
    </svg>
  );
};

/** Renders children several times across a 180° shutter centred on the frame and averages them: real motion blur. */
export const Blur: React.FC<{ active: boolean; samples?: number; children: React.ReactNode }> = ({ active, samples = 5, children }) => {
  const f = useCurrentFrame();
  if (!active) return <AbsoluteFill>{children}</AbsoluteFill>;
  return (
    <AbsoluteFill style={{ isolation: "isolate" }}>
      {Array.from({ length: samples }, (_, i) => (
        <AbsoluteFill key={i} style={{ mixBlendMode: "plus-lighter", filter: `opacity(${1 / samples})` }}>
          <Freeze frame={f - 0.25 + (0.5 * (i + 0.5)) / samples}>{children}</Freeze>
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};
