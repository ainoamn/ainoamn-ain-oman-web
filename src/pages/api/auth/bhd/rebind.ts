import type { NextApiRequest, NextApiResponse } from "next";
import { requestOrigin } from "@/lib/bhd/request-origin";
import {
  BHD_WIRE_SUB_COOKIE,
  identityIssuer,
  isSsoConfigured,
  safeReturnPath,
  wireSubCookieOptions,
} from "@/lib/bhd/identity";

async function profileFromWindowToken(token: string) {
  const issuer = identityIssuer();
  const response = await fetch(`${issuer}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`me_${response.status}`);
  const body = (await response.json()) as {
    user?: { id?: string; email?: string; name?: string } | null;
  };
  const user = body.user;
  const email = typeof user?.email === "string" ? user.email.trim().toLowerCase() : "";
  if (!user?.id || !email) throw new Error("claims");
  return { sub: user.id, email, name: user.name || email };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const origin = requestOrigin(req);
  let token = "";
  let returnTo = "/";

  if (req.method === "POST") {
    token = typeof req.body?.token === "string" ? req.body.token.trim() : String(req.body?.token || "").trim();
    returnTo = safeReturnPath(typeof req.body?.returnTo === "string" ? req.body.returnTo : "/");
  } else {
    returnTo = safeReturnPath(typeof req.query.returnTo === "string" ? req.query.returnTo : "/");
  }

  const auth = req.headers.authorization;
  if (!token && typeof auth === "string" && auth.toLowerCase().startsWith("bearer ")) {
    token = auth.slice(7).trim();
  }

  if (!isSsoConfigured()) {
    return res.status(503).json({
      message: "BHD rebind يتطلب BHD_OAUTH_CLIENT_ID — راجع docs/BHD-PRODUCT-WIRE.md",
    });
  }

  if (!token || token.length < 20) {
    const start = new URL("/api/auth/bhd/start", origin);
    start.searchParams.set("returnTo", returnTo);
    res.writeHead(303, { Location: start.toString() });
    return res.end();
  }

  try {
    const profile = await profileFromWindowToken(token);
    const current = req.cookies[BHD_WIRE_SUB_COOKIE];
    const target = new URL(returnTo, origin);
    if (current === profile.sub) {
      res.setHeader("Cache-Control", "no-store");
      res.writeHead(303, { Location: target.toString() });
      return res.end();
    }

    // TODO: rebind local ain-oman session to profile.sub (DB / AuthContext).
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    const maxAge = wireSubCookieOptions().maxAge;
    res.setHeader(
      "Set-Cookie",
      `${BHD_WIRE_SUB_COOKIE}=${encodeURIComponent(profile.sub)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`,
    );
    res.setHeader("Cache-Control", "no-store");
    res.writeHead(303, { Location: target.toString() });
    res.end();
  } catch {
    const logout = new URL("/api/auth/bhd/logout", origin);
    logout.searchParams.set(
      "continue",
      `/api/auth/bhd/start?returnTo=${encodeURIComponent(returnTo)}`,
    );
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    res.setHeader("Set-Cookie", `${BHD_WIRE_SUB_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
    res.writeHead(303, { Location: logout.toString() });
    res.end();
  }
}
