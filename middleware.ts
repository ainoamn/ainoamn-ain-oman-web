// middleware.ts
import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  console.log('[Middleware] Request:', pathname);
  
  // توحيد صفحة تسجيل الدخول إلى /Login
  if (pathname.toLowerCase() === "/login" && pathname !== "/Login") {
    console.log('[Middleware] Redirecting /login → /Login');
    const url = req.nextUrl.clone();
    url.pathname = "/Login";
    return NextResponse.redirect(url);
  }
  
  // إعادة التوجيه من /Profile (بحرف كبير) إلى /profile (بحرف صغير)
  if (pathname === "/Profile" || pathname.startsWith("/Profile/")) {
    console.log('[Middleware] Redirecting', pathname, '→', pathname.replace(/^\/Profile/, '/profile'));
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(/^\/Profile/, '/profile');
    return NextResponse.redirect(url, 307); // 307 = Temporary Redirect
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp).*)',
  ],
};
