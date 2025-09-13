// middleware.ts (di root, BUKAN di folder /middleware)
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// ⛔️ Jangan proteksi API atau assets
export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/buat-undangan",
    "/((?!api|_next|static|.*\\..*).*)",
  ],
};
