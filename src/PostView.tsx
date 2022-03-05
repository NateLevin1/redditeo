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
			<img
				style={{
					width: "110%",
					height: "110%",
					position: "absolute",
					top: "-5%",
					left: "-5%",
					zIndex: "0",
					filter: "blur(24px) hue-rotate(-15deg) brightness(0.8)",
					objectFit: "cover",
				}}
				src={image}
			></img>

			{/* Main image */}
			<img
				style={{
					width: "100%",
					height: "85%",
					objectFit: "contain",
					position: "relative",
					filter: "drop-shadow(0px 4px 16px rgba(0,0,0,0.75))",
					zIndex: "2",
				}}
				src={image}
			></img>

			{/* Text */}
			<div
				style={{
					position: "absolute",
					width: "100%",
					bottom: "6%",
				}}
			>
				<Text>I feel bad too</Text>
			</div>
		</div>
	);
};
