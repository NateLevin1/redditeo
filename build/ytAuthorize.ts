import fs from "fs";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import path from "path";
import readline from "readline";
const OAuth2 = google.auth.OAuth2;

// If modifying these scopes, delete your previously saved credentials
// at ./upload_app_session.json
const SCOPES = [
	"https://www.googleapis.com/auth/youtube.upload",
	"https://www.googleapis.com/auth/youtube.readonly",
];
const TOKEN_DIR = __dirname;
const TOKEN_PATH = path.join(TOKEN_DIR, "upload_app_session.json");

export const authorize = (credentials: any): Promise<OAuth2Client> => {
	return new Promise(async (res, rej) => {
		const clientSecret = credentials.installed.client_secret;
		const clientId = credentials.installed.client_id;
		const redirectUrl = credentials.installed.redirect_uris[0];
		const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

		// Check if we have previously stored a token.
		try {
			const token = await fs.promises.readFile(TOKEN_PATH, {
				encoding: "utf-8",
			});
			oauth2Client.credentials = JSON.parse(token);
			return res(oauth2Client);
		} catch (e) {
			return res(await getNewToken(oauth2Client));
		}
	});
};

const getNewToken = (oauth2Client: OAuth2Client): Promise<OAuth2Client> => {
	return new Promise((res, rej) => {
		const authUrl = oauth2Client.generateAuthUrl({
			access_type: "offline",
			scope: SCOPES,
		});
		console.log("Authorize this app by visiting this url: ", authUrl);
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});
		rl.question("Enter the code from that page here: ", (code) => {
			rl.close();
			oauth2Client.getToken(code, (error, token) => {
				if (error || !token) {
					rej(
						new Error("Error while trying to retrieve access token: " + error)
					);
					return;
				}

				oauth2Client.credentials = token;
				storeToken(token);
				return res(oauth2Client);
			});
		});
	});
};

const storeToken = (token: any) => {
	fs.writeFile(TOKEN_PATH, JSON.stringify(token), (error) => {
		if (error) throw error;
		console.log("YouTube token stored to " + TOKEN_PATH);
	});
};
