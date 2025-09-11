// src/pages/api/serial/next.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { key = "", prefix = "" } = (req.body ?? {}) as { key?: string; prefix?: string };
  if (!key) return res.status(400).json({ error: "key required" });

  const { nextSerial } = await import("@/server/serialNumbers");
  const value = await nextSerial(String(key), String(prefix));
  res.status(200).json({ value });
}
