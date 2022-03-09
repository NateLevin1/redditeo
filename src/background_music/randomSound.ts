import { random } from "remotion";
import sound1 from "./1.mp3";
import sound2 from "./2.mp3";
import sound3 from "./3.mp3";
import sound4 from "./4.mp3";

const sounds = [sound1, sound2, sound3, sound4];

export const getRandomSound = (seed: string) => {
	return sounds[Math.floor(random(seed) * sounds.length)];
};
