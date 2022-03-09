import {
	Audio,
	getInputProps,
	Img,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from "remotion";
import { getRandomSound } from "./background_music/randomSound";
import { Comment } from "./Helpers/Comment";
import { InputProps } from "./Helpers/InputProps";
import { Text } from "./Helpers/Text";
import { useProgress } from "./Helpers/useProgress";

export const PostView = () => {
	const { post, comment } = getInputProps() as InputProps;
	const { title, user, subreddit, seconds: postSeconds, imageUrl } = post;

	const progress = useProgress();
	const frame = useCurrentFrame();
	const { durationInFrames, fps } = useVideoConfig();
	const framesUntilComment = fps * postSeconds;
	const commentTop = interpolate(
		frame,
		[0, framesUntilComment, framesUntilComment + 10, durationInFrames],
		[100, 100, 0, 0]
	);

	return (
		<div
			style={{
				flex: 1,
				textAlign: "center",
				background: "#444444",
				color: "white",
				fontFamily: "Roboto",
			}}
		>
			{/* Blurred bg image */}
			<Img
				style={{
					width: "120%",
					height: "120%",
					position: "absolute",
					top: `calc(-5% + ${progress * -10}%)`,
					left: "-5%",
					zIndex: "0",
					filter: "blur(24px) hue-rotate(-15deg) brightness(0.8)",
					objectFit: "cover",
					transform: `scale(${1 + progress * 0.05})`,
				}}
				src={imageUrl}
			/>

			{/* Main image/comment */}
			<Img
				style={{
					width: "100%",
					height: "75%",
					objectFit: "contain",
					position: "relative",
					filter: "drop-shadow(0px 4px 16px rgba(0,0,0,0.75))",
					zIndex: "2",
					bottom: `${100 - commentTop}%`,
				}}
				src={imageUrl}
			/>
			<Comment {...comment} topOffset={commentTop} />

			{/* Text */}
			<div
				style={{
					position: "absolute",
					width: "100%",
					bottom: "6%",
				}}
			>
				<Text randomColor>{title}</Text>
			</div>

			{/* User+subreddit */}
			<div
				style={{
					position: "absolute",
					bottom: "3%",
					left: "0%",
					width: "100%",
				}}
			>
				<Text style={{ fontSize: "2.5em" }}>
					{user} on {subreddit}
				</Text>
			</div>

			{/* Audio */}
			<Audio
				src={getRandomSound(title)}
				endAt={durationInFrames * fps}
				volume={0.3}
			/>
		</div>
	);
};
