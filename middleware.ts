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
  
  // إعادة التوجيه من /Profile (بحرف كبير) إلى /profile (بحرف صغير)
  if (pathname === "/Profile" || pathname.startsWith("/Profile/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(/^\/Profile/, '/profile');
    return NextResponse.redirect(url, 308); // 308 = Permanent Redirect
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/Login", "/Profile", "/Profile/:path*", "/profile", "/profile/:path*"],
};
