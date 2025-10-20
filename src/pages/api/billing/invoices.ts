// @ts-nocheck
// src/pages/api/billing/invoices.ts - Temporary simplified version
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json({ invoices: [] });
  }
  return res.status(405).json({ error: "Method not allowed" });
}
