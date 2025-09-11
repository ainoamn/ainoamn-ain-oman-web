// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// يحذف محارف الاتجاه والمحارف الخفية من المسار ويعيد التوجيه للمسار النظيف
const STRIP = /[\u200E\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const cleaned = url.pathname.replace(STRIP, "");
  if (cleaned !== url.pathname) {
    const u = new URL(req.url);
    u.pathname = cleaned;
    return NextResponse.redirect(u, 308);
  }
  return NextResponse.next();
}

// فعّال على كل المسارات
export const config = { matcher: "/:path*" };
