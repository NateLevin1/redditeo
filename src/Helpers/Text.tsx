import { CSSProperties } from "react";

type SingleOrArray<T> = T | T[];
export const Text = ({
	children,
	style,
}: {
	children: SingleOrArray<string | number>;
	style?: CSSProperties;
}) => {
	return (
		<div
			style={{
				fontSize: "10.5em",
				lineHeight: "0.89em",
				color: "white",
				WebkitTextStroke: "10px black",
				...style,
			}}
		>
			{children ?? "[Empty Text]"}
		</div>
	);
};
