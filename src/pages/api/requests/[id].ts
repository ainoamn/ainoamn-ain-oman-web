// src/pages/api/requests/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { updateRequest } from "@/server/requests/store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const rid = Array.isArray(id) ? id[0] : id;
  if (!rid) return res.status(400).json({ error: "Missing id" });

  if (req.method === "PUT") {
    const patch = req.body || {};
    const updated = await updateRequest(String(rid), patch);
    if (!updated) return res.status(404).json({ error: "Not Found" });
    return res.status(200).json({ item: updated });
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
