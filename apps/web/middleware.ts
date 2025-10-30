import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // If logged in and trying to visit login/signup — redirect to app
    if (token && (pathname.startsWith("/login") || pathname.startsWith("/signup"))) {
      // Extract username from token email
      const username = token.email?.split('@')[0] || '';
      return NextResponse.redirect(new URL(`/dashboard/${username}`, req.url));
    }

    // If accessing /dashboard without username, redirect to /dashboard/username
    if (pathname === "/dashboard" && token) {
      const username = token.email?.split('@')[0] || '';
      return NextResponse.redirect(new URL(`/dashboard/${username}`, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // ✅ Public pages (no login needed)
        const isPublic =
          pathname === "/" ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/signup") ||
          pathname.startsWith("/verify") ||
          pathname.startsWith("/api/auth");

        if (isPublic) return true;

        // ✅ Everything else requires auth
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    // Run on all pages except public static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp).*)",
  ],
};
