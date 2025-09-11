// src/pages/api/serial/reset.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { key = "AO-T", value } = (req.body ?? {}) as { key?: string; value?: number };
  if (value === undefined) return res.status(400).json({ error: "value required" });

  const { resetCounter } = await import("@/server/serialNumbers");
  const newValue = await resetCounter(String(key), Number(value));
  res.status(200).json({ value: newValue });
}
