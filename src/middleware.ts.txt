import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Disabled by default. Enable by setting NEXT_PUBLIC_ENABLE_GUARD=true
  if (process.env.NEXT_PUBLIC_ENABLE_GUARD !== "true") {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  const pathname = url.pathname;
  const guardedPrefixes = ["/owners-association", "/invest"];

  const isGuarded = guardedPrefixes.some(p => pathname.startsWith(p));
  if (!isGuarded) return NextResponse.next();

  const plan = req.cookies.get("x-plan")?.value || "free";
  if (plan === "free") {
    url.pathname = "/pricing";
    url.searchParams.set("reason", "upgrade_required");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|static|favicon.ico).*)"],
};
