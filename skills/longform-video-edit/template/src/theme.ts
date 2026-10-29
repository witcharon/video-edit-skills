import look from "../look.json";
import { FONT } from "./fonts";

// The look lives in ../look.json and ./fonts.ts, both written by the look step (references/look.md).
// The template ships neither on purpose: it does not build until this project has its own look.
// This file turns them into values and holds the motion maths.
export { FONT };
export const FPS = 30;
export const W = 1920;
export const H = 1080;

type TypeRole = { weight: number; italic?: boolean; tracking: number; lineHeight?: number };

export type Look = {
  name: string;
  mode: "light" | "dark";
  palette: {
    ink: string; // type on the footage and on the ground
    light: string; // type over dark shots (Caption light)
    ground: string; // scene ground
    groundEdge: string;
    accent: string; // the one accent: carrier, rings, highlights
    accentDeep: string;
    card: string;
    cardText: string;
    muted: string;
    box: string; // the boxed word
    boxText: string;
    yes: string;
    no: string;
  };
  shadow: { ink: string; light: string }; // text-shadow for ink type and for light type on the footage
  ground: "paper" | "flat" | "gradient" | "glass" | "grid";
  carrier: "ribbon" | "marker" | "line" | "none";
  radius: number;
  type: { display: TypeRole; key: TypeRole; small: TypeRole; text: TypeRole };
};

export const LOOK = look as Look;
export const C = LOOK.palette;
export const DARK = LOOK.mode === "dark";
export const SHADOW = DARK
  ? "0 40px 90px -28px rgba(0,0,0,0.7), 0 10px 24px -10px rgba(0,0,0,0.5)"
  : "0 40px 90px -28px rgba(20,24,30,0.32), 0 10px 24px -10px rgba(20,24,30,0.2)";

const FAMILY = { display: FONT.display, key: FONT.display, small: FONT.small, text: FONT.text };

/** Family, weight, style, tracking and size of a type role. Write copy in its final case (CSS uppercase breaks Turkish İ). */
export const font = (role: keyof Look["type"], size: number): React.CSSProperties => {
  const r = LOOK.type[role];
  return {
    fontFamily: FAMILY[role],
    fontWeight: r.weight,
    fontStyle: r.italic ? "italic" : "normal",
    letterSpacing: `${r.tracking}em`,
    lineHeight: r.lineHeight ?? 1,
    fontSize: size,
  };
};

// [stiffness, damping] at mass 1 (motion-studio presets)
const PRESETS = {
  snappy: [320, 30],
  ui: [220, 24],
  base: [170, 26],
  heavy: [90, 20],
} as const;
export type Preset = keyof typeof PRESETS;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

/**
 * Spring progress 0 → 1 from t0, in closed form so it is continuous in time:
 * the motion-blur samples between frames land on real in-between positions.
 */
export const sp = (t: number, t0: number, preset: Preset = "base") => {
  const x = t - t0;
  if (x <= 0) return 0;
  const [k, c] = PRESETS[preset];
  const w0 = Math.sqrt(k);
  const z = c / (2 * w0);
  if (z >= 1) return 1 - Math.exp(-w0 * x) * (1 + w0 * x);
  const wd = w0 * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w0 * x) * (Math.cos(wd * x) + ((z * w0) / wd) * Math.sin(wd * x));
};

/** Accelerating exit 0 → 1 over d seconds, so the next beat hits at speed. */
export const out = (t: number, t1: number, d = 0.28) => clamp01((t - t1) / d) ** 3;

/** A short knock: 0 → 1 → 0 over d seconds. */
export const knock = (t: number, t0: number, d = 0.25) => (t < t0 || t > t0 + d ? 0 : Math.sin((Math.PI * (t - t0)) / d));

/** Visible window for a component that enters at t0 and has fully left 0.35 s after t1. */
export const live = (t: number, t0: number, t1: number) => t >= t0 - 0.05 && t <= t1 + 0.35;
