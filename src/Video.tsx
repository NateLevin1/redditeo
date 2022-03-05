import { Composition } from "remotion";
import { PostView } from "./PostView";
import "./font.css";

const fps = 30;
const seconds = 10;
export const RemotionVideo: React.FC = () => {
	return (
		<>
			<Composition
				id="PostView"
				component={PostView}
				durationInFrames={fps * seconds}
				fps={fps}
				width={1080}
				height={1920}
			/>
		</>
	);
};
