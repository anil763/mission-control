import { createServer } from "http";
import { exec } from "child_process";
import crypto from "crypto";

const CLIENT_ID = process.env.TWITTER_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3002/callback";
const SCOPES = "tweet.read tweet.write users.read offline.access";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Set TWITTER_CLIENT_ID and TWITTER_CLIENT_SECRET env vars.");
  process.exit(1);
}

// PKCE
const codeVerifier = crypto.randomBytes(32).toString("base64url");
const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");
const state = crypto.randomBytes(16).toString("hex");

const authUrl = `https://twitter.com/i/oauth2/authorize?` +
  `response_type=code&` +
  `client_id=${CLIENT_ID}&` +
  `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
  `scope=${encodeURIComponent(SCOPES)}&` +
  `state=${state}&` +
  `code_challenge=${codeChallenge}&` +
  `code_challenge_method=S256`;

console.log("\nOpen this URL in your browser:\n");
console.log(authUrl);
console.log("\nWaiting for callback...\n");
exec(`open "${authUrl}"`);

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost:3002");
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");

  if (!code || returnedState !== state) {
    res.end("Invalid callback."); return;
  }

  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  });

  const tokens = await tokenRes.json();

  if (tokens.access_token) {
    console.log("\n✅ Success! Add these to your .env.local:\n");
    console.log(`TWITTER_ACCESS_TOKEN=${tokens.access_token}`);
    if (tokens.refresh_token) {
      console.log(`TWITTER_REFRESH_TOKEN=${tokens.refresh_token}`);
    }
    res.end("<h2>✅ X/Twitter authorized! You can close this tab.</h2>");
  } else {
    console.log("\n❌ Error:", JSON.stringify(tokens, null, 2));
    res.end("<h2>❌ Error. Check terminal.</h2>");
  }

  server.close();
});

server.listen(3002, () => console.log("Listening on http://localhost:3002"));
