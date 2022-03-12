import { Composition, continueRender, delayRender, staticFile } from "remotion";
import { PostView } from "./PostView";
import "./font.css";
import { useCallback, useEffect, useState } from "react";
import { getAudioDuration } from "@remotion/media-utils";

const titleTTS = staticFile("/title.mp3");
const commentTTS = staticFile("/comment.mp3");

export const RemotionVideo: React.FC = () => {
	const fps = 30;
	const [handle] = useState(() => delayRender());

	const [titleTTSDuration, setTitleTTSDuration] = useState<number>();
	const [commentTTSDuration, setCommentTTSDuration] = useState<number>();
	const getAudioDurations = useCallback(async () => {
		setTitleTTSDuration(Math.ceil((await getAudioDuration(titleTTS)) * fps));
		setCommentTTSDuration(
			Math.ceil((await getAudioDuration(commentTTS)) * fps)
		);
		continueRender(handle);
	}, []);
	useEffect(() => {
		getAudioDurations();
	}, []);

	const postSeconds = 7 + Math.ceil((titleTTSDuration ?? 0) / fps / 3);
	const commentSeconds = Math.max(
		6,
		4 + Math.ceil((commentTTSDuration ?? 0) / fps)
	);

	const seconds = Math.round(postSeconds + commentSeconds);

	return (
		<>
			<Composition
				id="PostView"
				component={PostView}
				durationInFrames={fps * seconds}
				fps={fps}
				width={1080}
				height={1920}
				defaultProps={{
					postSeconds,
					titleTTSDuration,
					commentTTSDuration,
				}}
			/>
		</>
	);
};
