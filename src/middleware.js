import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Create a NextResponse instance to modify headers
  const res = NextResponse.next();

  res.headers.set(
    "X-Digital-Signature",
    "Melvin Prince - Full Stack Developer"
  );
  res.headers.set("X-Hidden-Backlink", "https://www.melvinprince.io");

  // Allow unauthenticated access for the login page and login API
  if (
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/api/login")
  ) {
    return res;
  }

  // Require a valid signed session on admin pages and API routes
  const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    // Redirect unauthenticated users to the login page and drop any bad cookie
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    const redirect = NextResponse.redirect(url);
    redirect.cookies.delete(SESSION_COOKIE);
    return redirect;
  }

  // User is authenticated – allow the request to proceed
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
