import { Img } from "remotion";
import { Text } from "./Helpers/Text";
import { useProgress } from "./Helpers/useProgress";
import image from "./testimg.png";

export const PostView = () => {
	const progress = useProgress();

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
				}}
				src={image}
			/>

			{/* Main image */}
			<Img
				style={{
					width: "100%",
					height: "85%",
					objectFit: "contain",
					position: "relative",
					filter: "drop-shadow(0px 4px 16px rgba(0,0,0,0.75))",
					zIndex: "2",
				}}
				src={image}
			/>

			{/* Text */}
			<div
				style={{
					position: "absolute",
					width: "100%",
					bottom: "6%",
				}}
			>
				<Text randomColor>I feel bad too</Text>
			</div>

			{/* User+subreddit */}
			<div
				style={{
					position: "absolute",
					bottom: "3%",
					left: "5%",
				}}
			>
				<Text style={{ fontSize: "2.5em" }}>
					u/yxingalisa on r/ProgrammerHumor
				</Text>
			</div>
		</div>
	);
};
