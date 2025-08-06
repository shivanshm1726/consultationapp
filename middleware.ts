// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/admin", "/reception"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get("token")?.value;

  if (!token) {
    // Redirect to login if no token found
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next(); // Allow if token is present
}

export const config = {
  matcher: ["/admin/:path*", "/reception/:path*"],
};
