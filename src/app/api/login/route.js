import { NextResponse } from "next/server";

export async function POST(request) {
  const { username, password } = await request.json();

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = "authenticated";

    const response = NextResponse.json({ success: true });
    response.cookies.set("auth-token", token, {
      maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
      httpOnly: true,
      path: "/", // Make sure it's available on all routes
    });
    return response;
  } else {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
}
