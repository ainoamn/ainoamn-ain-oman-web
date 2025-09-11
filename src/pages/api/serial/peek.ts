// src/pages/api/serial/peek.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { key = "", prefix = "" } = (req.query ?? {}) as { key?: string; prefix?: string };
  if (!key) return res.status(400).json({ error: "key required" });

  const { peekSerial } = await import("@/server/serialNumbers");
  const value = await peekSerial(String(key), String(prefix));
  res.status(200).json({ value });
}
