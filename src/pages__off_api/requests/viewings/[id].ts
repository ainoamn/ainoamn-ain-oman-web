// src/pages/api/requests/viewings/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { updateViewing } from "@/server/requests/store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const vid = Array.isArray(id) ? id[0] : id;
  if (!vid) return res.status(400).json({ error: "Missing id" });

  if (req.method === "PUT") {
    const patch = req.body || {};
    const item = await updateViewing(String(vid), patch);
    return res.status(200).json({ item });
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
