import { Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Comment } from "./Helpers/Comment";
import { Text } from "./Helpers/Text";
import { useProgress } from "./Helpers/useProgress";
import image from "./testimg.png";

export const PostView = () => {
	const title = "I feel bad too";
	const user = "u/yxingalisa";
	const subreddit = "r/ProgrammerHumor";
	const secondsUntilComment = 6;
	const comment = {
		text: "You know what helped me learn to code? Latin. Strongly typed, brutal syntax. And when you finally finish your glorious work, they just hand you more.",
		username: "OkCatch8292",
		pfp: "https://www.redditstatic.com/avatars/defaults/v2/avatar_default_1.png",
		upvotes: "1.9k",
	};

	const progress = useProgress();
	const frame = useCurrentFrame();
	const { durationInFrames, fps } = useVideoConfig();
	const framesUntilComment = fps * secondsUntilComment;
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
				src={image}
			/>

			{/* Main image/comment */}
			<Img
				style={{
					width: "100%",
					height: "85%",
					objectFit: "contain",
					position: "relative",
					filter: "drop-shadow(0px 4px 16px rgba(0,0,0,0.75))",
					zIndex: "2",
					bottom: `${100 - commentTop}%`,
				}}
				src={image}
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
		</div>
	);
};
