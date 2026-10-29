import type { NextApiRequest, NextApiResponse } from "next";
import { requestOrigin } from "@/lib/bhd/request-origin";
import {
  BHD_OAUTH_STATE_COOKIE,
  BHD_WIRE_SUB_COOKIE,
  endSessionUrl,
  isSafeNextPath,
  isSsoConfigured,
  oauthStateCookieOptions,
  wireSubCookieOptions,
} from "@/lib/bhd/identity";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const origin = requestOrigin(req);
  const cont = typeof req.query.continue === "string" ? req.query.continue : "";
  const localOnly = req.query.local === "1";

  let target: string;
  if (localOnly) {
    target = new URL("/", origin).toString();
  } else if (cont.startsWith("https://") || cont.startsWith("http://")) {
    try {
      const next = new URL(cont);
      const issuerHost = new URL(process.env.BHD_IDENTITY_ISSUER?.trim() || "https://id.bhd-om.com").host;
      const allowed =
        next.origin === origin ||
        next.host === issuerHost ||
        next.pathname.startsWith("/api/auth/bhd/");
      target = allowed ? cont : isSsoConfigured() ? endSessionUrl(origin) : new URL("/", origin).toString();
    } catch {
      target = isSsoConfigured() ? endSessionUrl(origin) : new URL("/", origin).toString();
    }
  } else if (isSafeNextPath(cont)) {
    target = new URL(cont, origin).toString();
  } else if (isSsoConfigured()) {
    target = endSessionUrl(origin);
  } else {
    target = new URL("/", origin).toString();
  }

  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", [
    `${BHD_WIRE_SUB_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
    `${BHD_OAUTH_STATE_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
    "uid=; Path=/; Max-Age=0; SameSite=Lax",
  ]);
  res.setHeader("Cache-Control", "no-store");
  res.writeHead(303, { Location: target });
  res.end();
}
