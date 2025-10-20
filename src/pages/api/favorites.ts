// @ts-nocheck
// src/pages/api/favorites.ts - Temporary simplified version
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json({ favorites: [] });
  }
  return res.status(405).json({ error: "Method not allowed" });
}
