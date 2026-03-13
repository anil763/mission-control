const CLIENT_ID = process.env.TWITTER_CLIENT_ID!;
const CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET!;

let cachedToken = process.env.TWITTER_ACCESS_TOKEN!;
let refreshToken = process.env.TWITTER_REFRESH_TOKEN!;

export async function getAccessToken(): Promise<string> {
  return cachedToken;
}

export async function refreshAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const res = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  const data = await res.json();
  if (data.access_token) {
    cachedToken = data.access_token;
    if (data.refresh_token) refreshToken = data.refresh_token;
  }
  return cachedToken;
}

export async function twitterFetch(url: string, options: RequestInit = {}) {
  let token = await getAccessToken();
  let res = await fetch(url, {
    ...options,
    headers: { ...(options.headers ?? {}), Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    token = await refreshAccessToken();
    res = await fetch(url, {
      ...options,
      headers: { ...(options.headers ?? {}), Authorization: `Bearer ${token}` },
    });
  }
  return res;
}

export async function postTweet(text: string) {
  const res = await twitterFetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return res.json();
}

export async function getTimeline(userId: string, maxResults = 10) {
  const res = await twitterFetch(
    `https://api.twitter.com/2/users/${userId}/timelines/reverse_chronological?max_results=${maxResults}&tweet.fields=created_at,public_metrics`
  );
  return res.json();
}

export async function searchTweets(query: string, maxResults = 10) {
  const res = await twitterFetch(
    `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=${maxResults}&tweet.fields=created_at,public_metrics,author_id`
  );
  return res.json();
}

export async function getMe() {
  const res = await twitterFetch("https://api.twitter.com/2/users/me");
  return res.json();
}
