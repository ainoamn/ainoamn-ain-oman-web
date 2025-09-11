// src/pages/api/messages/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { addMessage, listByProperty } from "@/server/messages/store";
import { getById } from "@/server/properties/store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = String(req.headers["x-user-id"] || "guest");
  if (req.method === "GET") {
    const { propertyId } = req.query;
    if (!propertyId) return res.status(400).json({ error: "Missing propertyId" });
    const items = await listByProperty(String(propertyId));
    return res.status(200).json({ items });
  }

  if (req.method === "POST") {
    try {
      const { propertyId, text, toId } = req.body || {};
      if (!propertyId || !text) return res.status(400).json({ error: "Missing fields" });
      // إذا لم يُمرّر toId نرسل لمالك العقار إن توفر
      let target = String(toId || "");
      if (!target) {
        const prop = await getById(String(propertyId));
        target = prop?.ownerId || `owner-${propertyId}`;
      }
      const msg = await addMessage({ propertyId: String(propertyId), fromId: userId, toId: target, text: String(text) });
      return res.status(200).json({ item: msg });
    } catch (e:any) {
      return res.status(400).json({ error: e?.message || "Bad Request" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
