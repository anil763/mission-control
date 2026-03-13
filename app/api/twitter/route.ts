import { NextResponse } from "next/server";
import { postTweet, getTimeline, searchTweets, getMe } from "@/lib/twitter";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") ?? "me";

  try {
    if (action === "me") {
      const data = await getMe();
      return NextResponse.json(data);
    }
    if (action === "timeline") {
      const me = await getMe();
      const userId = me.data?.id;
      if (!userId) return NextResponse.json({ error: "Could not get user ID" }, { status: 400 });
      const data = await getTimeline(userId, 20);
      return NextResponse.json(data);
    }
    if (action === "search") {
      const query = searchParams.get("q") ?? "AI agents";
      const data = await searchTweets(query, 10);
      return NextResponse.json(data);
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });
    const data = await postTweet(text);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
