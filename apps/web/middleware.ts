/**
 * Global Middleware for Authentication
 * 
 * This middleware protects routes that require authentication.
 * - Public routes: /, /login, /signup, /verify, /api/auth/*
 * - Private routes: /dashboard/*, /tasks/*, /profile/*, /api/* (except auth)
 * 
 * Unauthenticated users trying to access private routes are redirected to /login
 * Authenticated users trying to access /login or /signup are redirected to their dashboard
 */

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // If user is authenticated and tries to access login/signup, redirect to dashboard
    if (token && (pathname === "/login" || pathname === "/signup")) {
      const username = getUserSlugFromToken(token);
      return NextResponse.redirect(new URL(`/dashboard/${username}`, req.url));
    }

    // Allow the request to proceed
    return NextResponse.next();
  },
  {
    callbacks: {
      // Determine if the request should be authorized
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes that don't require authentication
        const publicRoutes = [
          "/",
          "/login",
          "/signup",
          "/verify",
        ];

        // API routes that don't require authentication
        const publicApiRoutes = [
          "/api/auth",
          "/api/auth/callback",
          "/api/auth/signin",
          "/api/auth/signout",
          "/api/auth/session",
          "/api/auth/providers",
          "/api/auth/csrf",
          "/api/auth/verify",
          "/api/auth/resend-otp",
          "/api/auth/check-user",
        ];

        // Check if the current path is a public route
        if (publicRoutes.includes(pathname)) {
          return true; // Allow access
        }

        // Check if the current path is a public API route
        if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
          return true; // Allow access
        }

        // For all other routes, require authentication
        return !!token;
      },
    },
    pages: {
      signIn: "/login", // Redirect to login page if not authenticated
    },
  }
);

// Helper function to extract username slug from token
function getUserSlugFromToken(token: any): string {
  const name = token?.name || "";
  const email = token?.email || "";
  
  if (name) {
    return name.toLowerCase().replace(/\s+/g, "-");
  }
  
  if (email) {
    return email.split("@")[0].toLowerCase();
  }
  
  return "user";
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp).*)",
  ],
};
