// File: app/api/checkAuth/route.js
import { NextResponse } from "next/server";

export async function GET(request) {
  const token = request.cookies.get("auth-token")?.value;
  return NextResponse.json({ authenticated: !!token });
}
