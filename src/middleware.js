import { NextResponse } from "next/server";

export function middleware(req) {
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

  // Check for the auth cookie on admin pages and API routes
  const token = req.cookies.get("auth-token");
  if (!token) {
    // Redirect unauthenticated users to the login page
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // User is authenticated – allow the request to proceed
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
