import type { NextApiRequest, NextApiResponse } from "next";
import * as store from "@/server/invoices/store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const id = String(req.query.id || "");
    if (!id) return res.status(400).json({ error: "id required" });

    if (req.method === "GET") {
      const item = store.get(id);
      if (!item) return res.status(404).json({ error: "Not found" });
      return res.status(200).json({ item });
    }

    if (req.method === "PUT" || req.method === "PATCH") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const item = store.upsert({ ...body, id });
      return res.status(200).json({ item });
    }

    if (req.method === "DELETE") {
      store.remove(id);
      return res.status(204).end();
    }

    res.setHeader("Allow", "GET,PUT,PATCH,DELETE");
    return res.status(405).end();
  } catch (e: any) {
    return res.status(400).json({ error: e?.message || "Bad Request" });
  }
}
