import { NextResponse } from "next/server";

/** Many browsers request /favicon.ico first; rewrite to our SVG so the Lovable default is never used. */
export function middleware(request) {
  if (request.nextUrl.pathname === "/favicon.ico") {
    return NextResponse.rewrite(new URL("/icon.svg", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/favicon.ico",
};
