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

const postId = "t7eyvw";

(async function () {
	const compositionId = "PostView";
	// * #### Get the top reddit post/post from postId
	const snoowrap = new Snoowrap({
		userAgent:
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15",
		// to get these values, see https://browntreelabs.com/scraping-reddits-api-with-snoowrap/
		// put them in a .env file in this folder
		clientId: process.env.clientId,
		clientSecret: process.env.clientSecret,
		refreshToken: process.env.refreshToken,
	});
	let currentPost: Submission | undefined;
	if (postId) {
		// by reddit ID
		// @ts-ignore
		currentPost = await snoowrap.getSubmission(postId);
	} else {
		// by top post
		// @ts-ignore
		const subreddit = (await snoowrap.getSubreddit(
			"programmerhumor"
		)) as Subreddit;
		// TODO: awaiting here is too early, we are fetching all data
		const topPosts = await subreddit.getTop({ time: "day", limit: 5 });
		for (const post of topPosts) {
			if (!post.is_video && !post.over_18) {
				currentPost = post;
				break;
			}
		}
	}
	if (!currentPost) return;

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
	console.log("Successfully got the top post! Input props are: ");
	console.log(inputProps);
	console.log("Stringified version: (for use in package.json start script)");
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
					console.log(`Rendered frame ${f}`);
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
	} catch (err) {
		console.error(err);
	}
})();
