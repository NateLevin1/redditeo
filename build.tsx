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
			seconds: 6,
			imageUrl: await currentPost.url,
		},
		comment: {
			text: await topComment.body,
			username: await topComment.author.name,
			pfp: await topComment.author.icon_img,
			upvotes: await topComment.ups,
			seconds: 6,
		},
	};
	console.log(
		"Stringified input props: (for use in package.json start script)"
	);
	console.log(
		JSON.stringify(inputProps).replace(/"/g, '\\"').replace(/'/g, "'\\\\''")
	);

	// * #### Actually do the generating of the video
	try {
		const bundled = await bundle(path.join(__dirname, "./src/index.tsx"));
		const comps = await getCompositions(bundled, {
			inputProps,
		});
		const video = comps.find((c) => c.id === compositionId);
		if (!video) {
			throw new Error(`No video called ${compositionId}`);
		}

		const tmpDir = await fs.promises.mkdtemp(
			path.join(os.tmpdir(), "remotion-")
		);
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

(async function () {
	const { singleOrTop } = await prompts({
		type: "autocomplete",
		name: "singleOrTop",
		message: "Single post or top of past day?",
		choices: [{ title: "single" }, { title: "top" }],
	});
	console.log(singleOrTop);

	if (singleOrTop === "single") {
		const { postId } = await prompts({
			type: "text",
			name: "postId",
			message: "Please enter the ID of the post (eg t7w271)",
		});
		// @ts-ignore
		const post = (await snoowrap.getSubmission(postId)) as Submission;
		await createVideoFromPost(post);
	} else {
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
	}
})();
