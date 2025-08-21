// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // اسمح بتمرير أي مسار كما هو (خاصة /admin/tasks و /admin/notifications)
  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // بالنسبة لباقي الموقع: لا تغييرات
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"], // فعّل الميدل وير على مسارات الإدارة فقط
};
