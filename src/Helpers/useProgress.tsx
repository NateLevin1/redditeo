import { useCurrentFrame, useVideoConfig } from "remotion";

export const useProgress = () => {
	const { durationInFrames } = useVideoConfig();
	const frame = useCurrentFrame();
	return frame / durationInFrames;
};
