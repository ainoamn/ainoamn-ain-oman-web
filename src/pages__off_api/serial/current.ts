// src/pages/api/serial/current.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const key = String((req.query.key ?? "AO-T") as string);
  const { getCurrentSequenceNumber } = await import("@/server/serialNumbers");
  const value = await getCurrentSequenceNumber(key);
  res.status(200).json({ value });
}
