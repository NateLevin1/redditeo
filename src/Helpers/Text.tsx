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
	const content = Array.isArray(children)
		? children.join("")
		: children.toString();

	const color = useMemo(() => {
		if (randomColor) {
			return getRandomColor(content);
		}
		return "white";
	}, []);

	return (
		<div
			style={{
				fontSize: `${lengthToFontSize(content.length)}em`,
				lineHeight: "0.89em",
				color: color,
				WebkitTextStroke: "0.06em black",
				width: "100%",
				overflowWrap: "break-word",
				padding: "0em 0.05em",
				textShadow: "0px 0.02em 0.1em rgba(0,0,0,0.5)",
				...style,
			}}
		>
			{content ?? "[Empty Text]"}
		</div>
	);
};

function getRandomColor(seed: string) {
	return colors[Math.floor(random(seed) * colors.length)];
}

function lengthToFontSize(length: number) {
	// this is magic that should look good most of the time
	// graph: https://www.desmos.com/calculator/lxss3qqhtp
	const a = 1.7 * Math.pow(10, 15);
	const h = -226;
	const p = -6.04;
	const k = 2.99312;
	return a * Math.pow(length - h, p) + k;
}
