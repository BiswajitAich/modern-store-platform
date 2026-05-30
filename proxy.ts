import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    // auth logic
    if (pathname.startsWith("/auth")) {
      const allowedWhenLoggedIn = [
        "/auth/forgotPassword",
      ];

      if (
        token &&
        !allowedWhenLoggedIn.some((route) =>
          pathname.startsWith(route)
        )
      ) {
        return NextResponse.redirect(new URL("/", req.url));
      }

      return NextResponse.next();
    }
    // admin logic
    if (pathname.startsWith("/admin")) {
      if (!token) {
        return NextResponse.redirect(new URL("/auth", req.url));
      }
      if (token && token.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return NextResponse.next();
    }
    // other protected routes
    if (!token) {
      return NextResponse.redirect(new URL("/auth", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/wishList/:path*",
    "/cart/:path*",
    "/auth/:path*",
  ],
};
