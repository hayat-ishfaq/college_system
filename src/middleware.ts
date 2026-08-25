import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Public routes — always accessible
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/"
  ) {
    // If already logged in, redirect to their dashboard
    if (session?.user && (pathname === "/login" || pathname === "/")) {
      const dashboardUrl = getDashboardUrl(session.user.role);
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }
    return NextResponse.next();
  }

  // No session → redirect to login
  if (!session?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user.role;

  // Admin-only routes
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(
      new URL(getDashboardUrl(role), request.url)
    );
  }

  // Teacher-only routes
  if (pathname.startsWith("/teacher") && role !== "TEACHER" && role !== "ADMIN") {
    return NextResponse.redirect(
      new URL(getDashboardUrl(role), request.url)
    );
  }

  // Student-only routes
  if (pathname.startsWith("/student") && role !== "STUDENT") {
    return NextResponse.redirect(
      new URL(getDashboardUrl(role), request.url)
    );
  }

  return NextResponse.next();
}

function getDashboardUrl(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "TEACHER":
      return "/teacher/dashboard";
    case "STUDENT":
      return "/student/dashboard";
    default:
      return "/login";
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|icons|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
