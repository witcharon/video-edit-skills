import type { Cue } from "./Camera";

// Every time on the output timeline, each one on a spoken word (scripts/out_words.py prints them).
// Single source of truth: scenes read their times here, audio.py reads them too, and the blur windows are built from them.
// Name each moment, put the words it sits on in a comment, e.g.
//   hook: { over: [0.11, 0.85, 1.29], big: 4.87, under: [3.39, 3.63], out: 7.2 }, // "… the spoken words …"
export const T = {};

// Camera layouts on spoken words. Glides (no `cut`) get motion blur; punch-ins happen on a cut.
//   { t: 7.47, to: "punch", cut: true }, { t: 103.5, to: "side" }, { t: 116.95, to: "full" }
export const CAMERA: Cue[] = [];

/** Starts of stretches where things travel hundreds of px per frame: more shutter samples so blur reads as a streak, not copies. */
export const FAST: number[] = [];

const times = (v: unknown): number[] =>
  typeof v === "number" ? [v] : Array.isArray(v) ? v.flatMap(times) : typeof v === "object" && v ? Object.values(v).flatMap(times) : [];

const OVERLAY_MOVES = times(T);
const CAMERA_MOVES = CAMERA.filter((c) => !c.cut).map((c) => c.t);

const within = (t: number, starts: number[], d: number) => starts.some((s) => t >= s - 0.05 && t <= s + d);

/** True while something on the overlay layer is still settling: only then is it rendered with motion blur. */
export const overlayMoving = (t: number) => within(t, OVERLAY_MOVES, 0.9);
export const cameraMoving = (t: number) => within(t, CAMERA_MOVES, 1.1);
export const overlayFast = (t: number) => within(t, FAST, 1.3);
