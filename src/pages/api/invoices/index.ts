import type { NextApiRequest, NextApiResponse } from "next";
import * as store from "@/server/invoices/store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const propertyId = req.query.propertyId ? String(req.query.propertyId) : undefined;
      const items = store.list({ propertyId });
      items.sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)));
      return res.status(200).json({ items });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      if (!body.propertyId) return res.status(400).json({ error: "propertyId required" });
      const item = store.upsert(body);
      return res.status(201).json({ item });
    }

    res.setHeader("Allow", "GET,POST");
    return res.status(405).end();
  } catch (e: any) {
    return res.status(400).json({ error: e?.message || "Bad Request" });
  }
}
