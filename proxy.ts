import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_ROUTES = ["/login", "/forgot-password", "/enter-otp", "/reset-password"];

const isAuthRoute = (pathname: string) =>
  AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (isAuthRoute(pathname)) {
    if (token?.role === "admin") {
      return NextResponse.redirect(new URL("/overview", request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token.role !== "admin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

