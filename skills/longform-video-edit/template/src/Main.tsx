import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Camera } from "./Camera";
import { Blur } from "./Ground";
import { Scenes } from "./Scenes";
import { CAMERA, cameraMoving, overlayFast, overlayMoving } from "./timeline";
import { FPS } from "./theme";

// The cut with its edit layer. Frames map 1:1 to the cut, so the cut's audio stays in sync by construction.
export const Main: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill>
      <Blur active={cameraMoving(t)}>
        <Camera cues={CAMERA} videoFrame={frame} />
      </Blur>
      <Blur active={overlayMoving(t)} samples={overlayFast(t) ? 14 : 5}>
        <Scenes />
      </Blur>
    </AbsoluteFill>
  );
};
