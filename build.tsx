import "dotenv/config";
import { bundle } from "@remotion/bundler";
import {
	getCompositions,
	renderFrames,
	stitchFramesToVideo,
} from "@remotion/renderer";
import fs from "fs";
import os from "os";
import path from "path";
import Snoowrap, { Submission, Subreddit } from "snoowrap";
import prompts from "prompts";
import { InputProps } from "./src/Helpers/InputProps";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";

const compositionId = "PostView";
const snoowrap = new Snoowrap({
	userAgent:
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15",
	// to get these values, see https://browntreelabs.com/scraping-reddits-api-with-snoowrap/
	// put them in a .env file in this folder
	clientId: process.env.clientId,
	clientSecret: process.env.clientSecret,
	refreshToken: process.env.refreshToken,
});
const exampleInputProps = {
	post: {
		title: "Uhhh…",
		user: "Twitch_xTUVALUx",
		subreddit: "r/ProgrammerHumor",
		imageUrl: "https://i.redd.it/62s1uswuqam81.jpg",
	},
	comment: {
		text: "As someone who uses auto save I am unable to relate",
		username: "ExoticPenguins",
		pfp: "https://styles.redditmedia.com/t5_ynp9i/styles/profileIcon_snoo45f2b6aa-f0fd-49bc-b390-d554bce55612-headshot-f.png?width=256&height=256&crop=256:256,smart&s=40cbba5f7acc5c545015d4a552a774800fe65f99",
		upvotes: "450",
	},
};
const ttsClient = new TextToSpeechClient();
let getAudio = true;
const publicPath = path.join(__dirname, "public");
const bgMusic = [
	path.join(publicPath, "1.mp3"),
	path.join(publicPath, "2.mp3"),
	path.join(publicPath, "3.mp3"),
	path.join(publicPath, "4.mp3"),
];

async function createVideoFromPost(currentPost: Submission) {
	// * #### Get the post from reddit

	let topComment;
	let index = 0;
	do {
		topComment = currentPost.comments.fetchMore({ amount: index + 1 })[index];
		if ((await topComment.body).length > 80) {
			index++;
			continue;
		}
		break;
	} while (true);

	const inputProps = {
		post: {
			title: await currentPost.title,
			user: await currentPost.author.name,
			subreddit: "r/" + (await currentPost.subreddit.display_name),
			imageUrl: await currentPost.url,
		},
		comment: {
			text: await topComment.body,
			username: await topComment.author.name,
			pfp: await topComment.author.icon_img,
			upvotes: (await topComment.ups).toString(),
		},
	};
	console.log(
		"Stringified input props: (for use in package.json start script)"
	);
	console.log(
		JSON.stringify(inputProps).replace(/"/g, '\\"').replace(/'/g, "'\\\\''")
	);

	return createVideoFromInputProps(inputProps);
}

async function createVideoFromInputProps(inputProps: InputProps) {
	try {
		// first we create the tmp directory
		// TODO: should we be deleting this?
		const tmpDir = await fs.promises.mkdtemp(
			path.join(os.tmpdir(), "remotion-")
		);

		// then we create the TTS files
		if (getAudio) {
			await Promise.all([
				getTTS(
					inputProps.post.title,
					path.join(__dirname, "public", "title.mp3")
				),
				getTTS(
					inputProps.comment.text,
					path.join(__dirname, "public", "comment.mp3")
				),
			]);
			console.log("Created TTS files.");
		}

		const [bgMusicPath, bgMusicIndex] = randomOfArray(bgMusic);
		if (getAudio) {
			await fs.promises.copyFile(
				bgMusicPath,
				path.join(__dirname, "public", "music.mp3")
			);
		}

		// then we make the video
		const bundled = await bundle(path.join(__dirname, "./src/index.tsx"));
		const comps = await getCompositions(bundled, {
			inputProps,
		});
		const video = comps.find((c) => c.id === compositionId);
		if (!video) {
			throw new Error(`No video called ${compositionId}`);
		}

		const { assetsInfo } = await renderFrames({
			config: video,
			webpackBundle: bundled,
			onStart: () => console.log("Rendering frames..."),
			onFrameUpdate: (f) => {
				if (f % 10 === 0) {
					process.stdout.write(`Rendered frame ${f}\r`);
				}
			},
			parallelism: null,
			outputDir: tmpDir,
			inputProps,
			compositionId,
			imageFormat: "jpeg",
		});

		const finalOutput = path.join(tmpDir, "out.mp4");
		await stitchFramesToVideo({
			dir: tmpDir,
			force: true,
			fps: video.fps,
			height: video.height,
			width: video.width,
			outputLocation: finalOutput,
			imageFormat: "jpeg",
			assetsInfo,
		});
		console.log("Finished rendering! " + finalOutput);
		return finalOutput;
	} catch (err) {
		console.error(err);
	}
}

const ttsVoices = [
	"en-US-Wavenet-J",
	"en-US-Wavenet-H",
	"en-US-Wavenet-G",
	"en-US-Wavenet-B",
];
async function getTTS(text: string, filepath: string) {
	// Construct the request
	const request = {
		input: { text },
		voice: { languageCode: "en-US", name: randomOfArray(ttsVoices)[0] },
		audioConfig: { audioEncoding: "MP3", speakingRate: 1.02 },
	} as const;

	// Performs the text-to-speech request
	const [response] = await ttsClient.synthesizeSpeech(request);
	// Write the binary audio content to a local file
	if (response.audioContent) {
		await fs.promises.writeFile(filepath, response.audioContent, "binary");
	} else {
		throw "Received no audio!";
	}
}

(async function () {
	const { howToGetPosts } = await prompts({
		type: "autocomplete",
		name: "howToGetPosts",
		message: "How should we get the posts?",
		choices: [{ title: "top" }, { title: "single" }, { title: "example" }],
	});

	if (howToGetPosts === "single") {
		const { postId } = await prompts({
			type: "text",
			name: "postId",
			message: "Please enter the ID of the post (eg t7w271)",
		});
		// @ts-ignore
		const post = (await snoowrap.getSubmission(postId)) as Submission;
		await createVideoFromPost(post);
	} else if (howToGetPosts == "top") {
		const { number } = await prompts({
			type: "number",
			name: "number",
			message: "How many of the top posts should be used?",
			min: 1,
			max: 50,
		});
		let paths: string[] = [];

		// @ts-ignore
		const subreddit = (await snoowrap.getSubreddit(
			"programmerhumor"
		)) as Subreddit;

		const topPosts = await subreddit.getTop({ time: "day", limit: number });
		for (const post of topPosts) {
			if (!post.is_video && !post.over_18) {
				const path = await createVideoFromPost(post);
				if (path) {
					paths.push(path);
				}
			}
		}

		console.log("\n\n\nCREATED VIDEOS!");
		for (const path of paths) {
			console.log(path);
		}
	} else if (howToGetPosts == "example") {
		getAudio = false;
		await createVideoFromInputProps(exampleInputProps);
		console.log("Successfully created video.");
	}
})();

function randomOfArray<T>(array: T[]): [T, number] {
	const ind = Math.floor(Math.random() * array.length);
	return [array[ind], ind];
}
