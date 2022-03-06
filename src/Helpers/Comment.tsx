import { Img } from "remotion";

export const Comment = ({
	text,
	username,
	pfp,
	upvotes,
	topOffset,
}: {
	text: string;
	username: string;
	pfp: string;
	upvotes: string;
	topOffset: number;
}) => {
	return (
		<div
			style={{
				width: "100%",
				height: "85%",
				position: "absolute",
				display: "flex",
				alignItems: "center",
				top: `${topOffset}%`,
			}}
		>
			<div
				style={{
					padding: "0.5em 0.5em",
					width: "100%",
					fontSize: "5em",
					textAlign: "left",
					background: "rgba(255,255,255,0.15)",
					backdropFilter: "brightness(0.5)",
					boxShadow: "0px 0px 16px rgba(0,0,0,0.75)",
				}}
			>
				<div>
					<Img
						src={pfp}
						style={{
							display: "inline-block",
							borderRadius: "100%",
							width: "1.5em",
							verticalAlign: "middle",
						}}
					/>
					<div
						style={{
							display: "inline-block",
							fontSize: "0.8em",
							verticalAlign: "middle",
							marginLeft: "0.5em",
						}}
					>
						{username}
					</div>
				</div>

				<hr></hr>

				<div>{text}</div>

				<hr></hr>

				<div
					style={{
						fontSize: "0.6em",
					}}
				>
					Top Comment — {upvotes} upvotes
				</div>
			</div>
		</div>
	);
};
