// @ts-nocheck
// src/pages/api/auth/admin-login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { adminCookieName, isAdminCookie } from "@/server/auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }
  const { key } = req.body || {};
  const correct = process.env.ADMIN_KEY || "";
  if (!key || key !== correct) {
    return res.status(401).json({ ok: false, error: "BAD_KEY" });
  }
  const cookie = `${adminCookieName()}=${encodeURIComponent(String(key))}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax; HttpOnly`;
  res.setHeader("Set-Cookie", cookie);
  return res.status(200).json({ ok: true });
}
