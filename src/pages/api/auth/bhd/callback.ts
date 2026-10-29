import type { NextApiRequest, NextApiResponse } from "next";
import { requestOrigin } from "@/lib/bhd/request-origin";
import {
  BHD_OAUTH_STATE_COOKIE,
  BHD_WIRE_SUB_COOKIE,
  exchangeAuthorizationCode,
  isSafeNextPath,
  isSsoConfigured,
  oauthStateCookieOptions,
  parseOAuthState,
  readVerifiedIdentityProfile,
  safeReturnPath,
  wireSubCookieOptions,
} from "@/lib/bhd/identity";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const origin = requestOrigin(req);
  const fail = (reason: string) => {
    const login = new URL("/", origin);
    login.searchParams.set("bhd_error", reason);
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    res.setHeader("Set-Cookie", `${BHD_OAUTH_STATE_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
    res.writeHead(302, { Location: login.toString() });
    res.end();
  };

  if (!isSsoConfigured()) {
    return res.status(503).json({
      message: "BHD SSO غير مُعدّ — راجع BHD_OAUTH_* في .env",
    });
  }

  const error = typeof req.query.error === "string" ? req.query.error : "";
  const code = typeof req.query.code === "string" ? req.query.code : "";
  const state = typeof req.query.state === "string" ? req.query.state : "";
  const rawState = req.cookies[BHD_OAUTH_STATE_COOKIE];
  const saved = parseOAuthState(rawState);

  if (error) return fail(error.slice(0, 40));
  if (!saved || saved.state !== state || !code) return fail("state");

  let profile;
  try {
    const tokens = await exchangeAuthorizationCode({
      code,
      redirectUri: saved.redirectUri,
      codeVerifier: saved.verifier,
    });
    profile = readVerifiedIdentityProfile(tokens.idToken, saved.nonce);
  } catch {
    return fail("token");
  }

  // TODO: map profile.sub → ain-oman local user / AuthContext (see docs/BHD-PRODUCT-WIRE.md).
  const dest = isSafeNextPath(saved.returnTo) ? saved.returnTo : safeReturnPath("/");
  const target = new URL(dest, origin);

  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const maxAge = wireSubCookieOptions().maxAge;
  res.setHeader("Set-Cookie", [
    `${BHD_OAUTH_STATE_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
    `${BHD_WIRE_SUB_COOKIE}=${encodeURIComponent(profile.sub)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`,
  ]);
  res.setHeader("Cache-Control", "no-store");
  res.writeHead(302, { Location: target.toString() });
  res.end();
}
