import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
} from "@/lib/session";

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

// Constant-time string comparison. Hashing first gives equal-length buffers,
// so neither the content nor the length of the stored value leaks via timing.
function safeEqual(a, b) {
  const hash = (value) => createHash("sha256").update(String(value)).digest();
  return timingSafeEqual(hash(a), hash(b));
}

export async function POST(request) {
  const { username, password } = await request.json().catch(() => ({}));

  // Check every user without short-circuiting so timing doesn't reveal
  // which usernames exist.
  let matchedUser = null;
  for (const user of getAdminUsers()) {
    const usernameMatches = safeEqual(user.username, username ?? "");
    const passwordMatches = safeEqual(user.password, password ?? "");
    if (usernameMatches && passwordMatches && !matchedUser) {
      matchedUser = user.username;
    }
  }

  if (!matchedUser) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createSessionToken(matchedUser);
  if (!token) {
    console.error("ADMIN_SESSION_SECRET is missing or shorter than 32 characters");
    return NextResponse.json(
      { error: "Login is not configured on the server" },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, token, {
    maxAge: SESSION_MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/", // Make sure it's available on all routes
  });
  return response;
}
