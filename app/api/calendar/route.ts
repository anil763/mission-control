import { NextResponse } from "next/server";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN!;

async function getAccessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  return data.access_token as string;
}

export async function GET() {
  try {
    const accessToken = await getAccessToken();

    const now = new Date().toISOString();
    const future = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(); // 2 weeks

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${encodeURIComponent(now)}&` +
        `timeMax=${encodeURIComponent(future)}&` +
        `singleEvents=true&` +
        `orderBy=startTime&` +
        `maxResults=50`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        next: { revalidate: 300 }, // cache 5 min
      }
    );

    const data = await res.json();

    const events = (data.items ?? []).map((e: any) => ({
      id: e.id,
      title: e.summary ?? "(No title)",
      description: e.description ?? null,
      start: e.start?.dateTime ?? e.start?.date,
      end: e.end?.dateTime ?? e.end?.date,
      allDay: !e.start?.dateTime,
      location: e.location ?? null,
      htmlLink: e.htmlLink,
      colorId: e.colorId ?? null,
    }));

    return NextResponse.json({ events });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch calendar" }, { status: 500 });
  }
}
