import type { NextApiRequest } from "next";

export interface AppUser {
  id: string;
  name?: string;
  roles?: string[];
  plan?: "free" | "pro" | "enterprise";
}

export function decodeToken(token?: string | null): AppUser | null {
  if (!token) return null;
  try {
    // NOTE: placeholder decoding. Replace with real JWT verify (e.g., jose).
    const payloadBase64 = token.split(".")[1];
    const json = Buffer.from(payloadBase64, "base64").toString("utf8");
    return JSON.parse(json) as AppUser;
  } catch {
    return null;
  }
}

export function getUserFromReq(req: NextApiRequest): AppUser | null {
  const token = req.headers.authorization?.replace("Bearer ", "") || req.cookies?.token;
  return decodeToken(token);
}
