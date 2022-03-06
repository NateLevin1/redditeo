export type InputProps = {
	post: {
		title: string;
		user: string;
		subreddit: string;
		seconds: number;
		imageUrl: string;
	};
	comment: {
		text: string;
		username: string;
		pfp: string;
		upvotes: string;
		seconds: number;
	};
};
