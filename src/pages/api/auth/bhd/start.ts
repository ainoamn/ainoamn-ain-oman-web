import type { NextApiRequest, NextApiResponse } from "next";
import { requestOrigin } from "@/lib/bhd/request-origin";
import {
  BHD_OAUTH_STATE_COOKIE,
  BHD_WIRE_SUB_COOKIE,
  identityIssuer,
  isSsoConfigured,
  oauthClientId,
  oauthRedirectUri,
  oauthStateCookieOptions,
  randomUrlToken,
  safeReturnPath,
  sha256Base64Url,
  wireSubCookieOptions,
} from "@/lib/bhd/identity";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const origin = requestOrigin(req);
  const returnTo = safeReturnPath(
    typeof req.query.returnTo === "string" ? req.query.returnTo : typeof req.query.next === "string" ? req.query.next : "/",
  );

  if (!isSsoConfigured()) {
    return res.status(503).json({
      message: "BHD SSO غير مُعدّ. عيّن BHD_OAUTH_CLIENT_ID (و BHD_OAUTH_CLIENT_SECRET إن لزم) من id.bhd-om.com/admin#connect",
      env: ["BHD_IDENTITY_ISSUER", "BHD_OAUTH_CLIENT_ID", "BHD_OAUTH_CLIENT_SECRET", "BHD_OAUTH_REDIRECT_URI"],
    });
  }

  const state = randomUrlToken();
  const nonce = randomUrlToken();
  const verifier = randomUrlToken(48);
  const challenge = sha256Base64Url(verifier);
  const redirectUri = oauthRedirectUri(origin);
  const issuer = identityIssuer();

  const authorize = new URL("/oauth/authorize", issuer);
  authorize.searchParams.set("client_id", oauthClientId());
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("scope", "openid profile email");
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("nonce", nonce);
  authorize.searchParams.set("code_challenge", challenge);
  authorize.searchParams.set("code_challenge_method", "S256");

  const oauthPayload = JSON.stringify({ state, nonce, verifier, returnTo, redirectUri });
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", [
    `${BHD_OAUTH_STATE_COOKIE}=${oauthPayload}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${oauthStateCookieOptions().maxAge}${secure}`,
    `${BHD_WIRE_SUB_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
  ]);
  res.setHeader("Cache-Control", "no-store");
  res.writeHead(302, { Location: authorize.toString() });
  res.end();
}
