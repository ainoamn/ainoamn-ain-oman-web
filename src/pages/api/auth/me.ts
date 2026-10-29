import type { NextApiRequest, NextApiResponse } from "next";
import { BHD_WIRE_SUB_COOKIE } from "@/lib/bhd/identity";

/**
 * Product session read — no Set-Cookie. BHD wire sub from HttpOnly cookie when present.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");

  const wireSub = req.cookies[BHD_WIRE_SUB_COOKIE];
  if (typeof wireSub === "string" && wireSub.trim()) {
    return res.status(200).json({
      ok: true,
      user: { id: wireSub.trim() },
    });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      user: null,
    });
  }

  try {
    const token = authHeader.split(" ")[1];
    const userData = JSON.parse(token);
    return res.status(200).json({
      ok: true,
      user: userData,
    });
  } catch {
    return res.status(401).json({
      error: "Invalid token",
      user: null,
    });
  }
}
