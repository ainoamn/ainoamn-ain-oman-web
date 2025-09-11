// src/pages/api/properties/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { readAll, upsert, type Property } from "@/server/properties/store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "GET") {
    const items = readAll();
    return res.status(200).json({ items });
  }

  if (req.method === "POST") {
    try {
      const b = (req.body || {}) as Partial<Property>;
      const now = new Date().toISOString();
      const id =
        b.id?.toString() ||
        "P-" + now.replace(/[-:.TZ]/g, "").slice(0, 14); // خادم يتولّى ID
      const item: Property = {
        id,
        referenceNo: b.referenceNo || "",
        title: b.title || { ar: "", en: "" },
        priceOMR: Number(b.priceOMR ?? 0),
        province: b.province || "",
        state: b.state || "",
        village: b.village || "",
        purpose: (b.purpose as any) || "rent",
        type: (b.type as any) || "apartment",
        status: (b.status as any) || "vacant",
        createdAt: now,
        updatedAt: now,
      };
      upsert(item);
      return res.status(201).json({ id: item.id, item });
    } catch (e: any) {
      return res.status(400).json({ error: e?.message || "Bad Request" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
