import { AbsoluteFill, Freeze, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { Ground } from "./Ground";
import { FACE, VIDEO } from "./shot";
import { FPS, H, SHADOW, W, mix, sp } from "./theme";

// The talking-head shot drawn inside a clip rectangle that springs between layouts, over the scene ground.

type Layout = { x: number; y: number; w: number; h: number; r: number; scale: number; ax: number; ay: number; gray: number };

const full: Layout = { x: 0, y: 0, w: W, h: H, r: 0, scale: 1, ax: FACE.x / W, ay: FACE.y / H, gray: 0 };
export const LAYOUT = {
  full,
  punch: { ...full, scale: 1.16 }, // a punch-in on a key word (on a cut)
  punchGray: { ...full, scale: 1.24, gray: 1 }, // the same in black and white, for one key term
  side: { x: 1060, y: 70, w: 800, h: 940, r: 40, scale: 1.15, ax: 0.5, ay: 0.27, gray: 0 }, // camera card right, scene left (x: 60 for a left card)
} satisfies Record<string, Layout>;

export type Cue = { t: number; to: keyof typeof LAYOUT; cut?: boolean };

const KEYS = ["x", "y", "w", "h", "r", "scale", "ax", "ay", "gray"] as const;

const layoutAt = (cues: Cue[], t: number): Layout => {
  const i = cues.findLastIndex((c) => c.t <= t);
  if (i < 0) return full;
  const from = i > 0 ? LAYOUT[cues[i - 1].to] : full;
  const to = LAYOUT[cues[i].to];
  const p = cues[i].cut ? 1 : sp(t, cues[i].t, "heavy");
  return Object.fromEntries(KEYS.map((k) => [k, mix(from[k], to[k], p)])) as Layout;
};

/** Video position inside the rectangle: the face lands on the anchor point, the frame always covers the rectangle. */
const place = (l: Layout) => {
  const vw = W * l.scale;
  const vh = H * l.scale;
  const left = l.x + l.w * l.ax - FACE.x * l.scale;
  const top = l.y + l.h * l.ay - FACE.y * l.scale;
  return {
    vw,
    vh,
    left: Math.min(l.x, Math.max(l.x + l.w - vw, left)),
    top: Math.min(l.y, Math.max(l.y + l.h - vh, top)),
  };
};

/** `videoFrame` is the real frame: motion-blur samples move the card between frames, never the picture inside it. */
export const Camera: React.FC<{ cues: Cue[]; videoFrame: number }> = ({ cues, videoFrame }) => {
  const t = useCurrentFrame() / FPS;
  const l = layoutAt(cues, t);
  const v = place(l);
  const framed = l.r > 0.5;
  return (
    <AbsoluteFill>
      {framed ? <Ground /> : null}
      <div style={{ position: "absolute", left: l.x, top: l.y, width: l.w, height: l.h, borderRadius: l.r, overflow: "hidden", boxShadow: framed ? SHADOW : undefined }}>
        <Freeze frame={videoFrame}>
          <OffthreadVideo
            src={staticFile(VIDEO)}
            muted
            style={{
              position: "absolute",
              left: v.left - l.x,
              top: v.top - l.y,
              width: v.vw,
              height: v.vh,
              filter: l.gray > 0.01 ? `grayscale(${l.gray}) contrast(${1 + 0.15 * l.gray})` : undefined,
            }}
          />
        </Freeze>
        {framed ? <div style={{ position: "absolute", inset: 0, borderRadius: l.r, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.35)" }} /> : null}
      </div>
    </AbsoluteFill>
  );
};
