import { CSSProperties, useMemo } from "react";
import { random } from "remotion";

const colors = ["#F52F40", "#FFC400", "#F54757", "#2FF55C", "#3BABF5"];

type SingleOrArray<T> = T | T[];
export const Text = ({
	children,
	style,
	randomColor,
}: {
	children: SingleOrArray<string | number>;
	style?: CSSProperties;
	randomColor?: boolean;
}) => {
	const color = useMemo(() => {
		if (randomColor) {
			return getRandomColor(children + "");
		}
		return "white";
	}, []);

	return (
		<div
			style={{
				fontSize: "10.5em",
				lineHeight: "0.89em",
				color: color,
				WebkitTextStroke: "0.06em black",
				...style,
			}}
		>
			{children ?? "[Empty Text]"}
		</div>
	);
};

function getRandomColor(seed: string) {
	return colors[Math.floor(random(seed) * colors.length)];
}
