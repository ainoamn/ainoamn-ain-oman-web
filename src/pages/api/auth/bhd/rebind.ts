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

function bindReturnPath(returnTo: string, sub: string, origin: string) {
  const safe = safeReturnPath(returnTo);
  try {
    const url = new URL(safe, origin);
    url.searchParams.set("au", sub);
    url.searchParams.set("_bhd", String(Date.now()));
    return url.toString();
  } catch {
    return new URL(safe, origin).toString();
  }
}

function wantsJson(req: NextApiRequest) {
  const accept = req.headers.accept || "";
  return accept.includes("application/json");
}

function wireCookieHeader(sub: string, maxAge: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${BHD_WIRE_SUB_COOKIE}=${encodeURIComponent(sub)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function clearWireCookieHeader() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${BHD_WIRE_SUB_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const json = wantsJson(req);
  const origin = requestOrigin(req);
  let token = "";
  let returnTo = "/";

  const contentType = req.headers["content-type"] || "";
  if (req.method === "POST" && contentType.includes("application/json")) {
    token = typeof req.body?.token === "string" ? req.body.token.trim() : "";
    returnTo = safeReturnPath(typeof req.body?.returnTo === "string" ? req.body.returnTo : "/");
  } else if (req.method === "POST") {
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
    if (json) return res.status(503).json({ ok: false, error: "sso" });
    return res.status(503).json({
      message: "BHD rebind يتطلب BHD_OAUTH_CLIENT_ID — راجع docs/BHD-PRODUCT-WIRE.md",
    });
  }

  if (!token || token.length < 20) {
    if (json) return res.status(401).json({ ok: false, error: "token" });
    const start = new URL("/api/auth/bhd/start", origin);
    start.searchParams.set("returnTo", returnTo);
    res.writeHead(303, { Location: start.toString() });
    return res.end();
  }

  const maxAge = wireSubCookieOptions().maxAge ?? 86400;

  try {
    const profile = await profileFromWindowToken(token);
    const current = req.cookies[BHD_WIRE_SUB_COOKIE];

    if (current === profile.sub) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.setHeader("Pragma", "no-cache");
      if (json) {
        return res.status(200).json({
          ok: true,
          unchanged: true,
          user: { id: profile.sub, email: profile.email, name: profile.name },
        });
      }
      const target = new URL(returnTo, origin);
      res.writeHead(303, { Location: target.toString() });
      return res.end();
    }

    res.setHeader("Set-Cookie", wireCookieHeader(profile.sub, maxAge));
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");

    if (json) {
      return res.status(200).json({
        ok: true,
        user: { id: profile.sub, email: profile.email, name: profile.name },
      });
    }

    res.writeHead(303, { Location: bindReturnPath(returnTo, profile.sub, origin) });
    res.end();
  } catch {
    res.setHeader("Set-Cookie", clearWireCookieHeader());
    if (json) {
      return res.status(401).json({ ok: false, error: "rebind" });
    }
    const logout = new URL("/api/auth/bhd/logout", origin);
    logout.searchParams.set(
      "continue",
      `/api/auth/bhd/start?returnTo=${encodeURIComponent(returnTo)}`,
    );
    res.writeHead(303, { Location: logout.toString() });
    res.end();
  }
}
