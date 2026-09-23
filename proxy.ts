import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const callbackUrl =
    searchParams.get("callbackUrl") ||
    searchParams.get("redirect_uri") ||
    searchParams.get("redirect") ||
    searchParams.get("ref");

  // Direct visits to signin.grafene.in without a reference callback target get redirected to main site
  if (
    (pathname === "/" || pathname === "/auth/signin" || pathname === "/auth/signup") &&
    !callbackUrl
  ) {
    const mainSiteUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://grafene.in";
    return NextResponse.redirect(mainSiteUrl, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/auth/signin", "/auth/signup"],
};
