import { Composition, getInputProps } from "remotion";
import { PostView } from "./PostView";
import "./font.css";
import { InputProps } from "./Helpers/InputProps";

export const RemotionVideo: React.FC = () => {
	const fps = 30;
	const {
		post: { seconds: postSeconds },
		comment: { seconds: commentSeconds },
	} = getInputProps() as InputProps;
	const seconds = postSeconds + commentSeconds;

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
