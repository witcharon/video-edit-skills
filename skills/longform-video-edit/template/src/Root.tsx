import { Composition } from "remotion";
import { Main } from "./Main";
import { SECONDS } from "./shot";
import { FPS, H, W } from "./theme";

export const RemotionRoot: React.FC = () => <Composition id="Main" component={Main} durationInFrames={Math.round(SECONDS * FPS)} fps={FPS} width={W} height={H} />;
