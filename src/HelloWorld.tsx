import { useVideoConfig } from "remotion";

export const HelloWorld = () => {
	const { fps, durationInFrames, width, height } = useVideoConfig();
	return (
		<div
			style={{
				flex: 1,
				textAlign: "center",
				fontSize: "7em",
				background: "black",
				color: "white",
				fontFamily: "Nunito",
			}}
		>
			Hello World!
		</div>
	);
};
