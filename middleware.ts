import { NextRequest, NextResponse } from "next/server";

function unauthorizedResponse() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Mission Control"',
      "Cache-Control": "no-store",
    },
  });
}

export function middleware(req: NextRequest) {
  const username = process.env.MC_USERNAME;
  const password = process.env.MC_PASSWORD;

  // If credentials are not set, block access rather than exposing data.
  if (!username || !password) {
    return new NextResponse("Mission Control is locked. Set MC_USERNAME and MC_PASSWORD.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Basic ")) {
    return unauthorizedResponse();
  }

  const encoded = authHeader.split(" ")[1] ?? "";
  let decoded = "";
  try {
    decoded = atob(encoded);
  } catch {
    return unauthorizedResponse();
  }

  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) return unauthorizedResponse();

  const providedUser = decoded.slice(0, separatorIndex);
  const providedPass = decoded.slice(separatorIndex + 1);

  if (providedUser !== username || providedPass !== password) {
    return unauthorizedResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
