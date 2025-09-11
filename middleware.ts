// middleware.ts
import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // توحيد صفحة تسجيل الدخول إلى /Login
  if (pathname.toLowerCase() === "/login" && pathname !== "/Login") {
    const url = req.nextUrl.clone();
    url.pathname = "/Login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/Login"],
};
