// File: app/api/checkAuth/route.js
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function GET(request) {
  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value
  );
  return NextResponse.json({ authenticated: !!session });
}
