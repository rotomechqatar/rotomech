import { NextResponse } from "next/server";

// ADMIN_USERS holds every admin login as "username:password" pairs separated
// by commas, e.g. "alice:secret1,bob:secret2". Passwords may contain ":".
function getAdminUsers() {
  return (process.env.ADMIN_USERS || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const separator = entry.indexOf(":");
      return {
        username: entry.slice(0, separator),
        password: entry.slice(separator + 1),
      };
    })
    .filter((user) => user.username && user.password);
}

export async function POST(request) {
  const { username, password } = await request.json();

  const isValid = getAdminUsers().some(
    (user) => user.username === username && user.password === password
  );

  if (isValid) {
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
