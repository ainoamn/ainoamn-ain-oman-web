// src/pages/api/properties/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { readJson } from "@/server/fsdb";

type AnyObj = Record<string, any>;
type Property = AnyObj;

function normalizeRef<T extends Record<string, any>>(obj: T | null): T | null {
  if (!obj) return obj;
  if (!obj.referenceNo && obj.serial) return { ...obj, referenceNo: obj.serial };
  return obj;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const id = String(req.query.id || "");
  try {
    // 1) من المخزّن
    const list = await readJson<Property[]>("properties", []);
    let item = list.find((p) => String(p?.id) === id) || null;

    // 2) إن لم يوجد، من demoData (اختياري)
    if (!item) {
      try {
        const mod: any = await import("@/lib/demoData").catch(() => ({}));
        const arr: any[] = mod?.PROPERTIES || mod?.properties || mod?.default || [];
        if (Array.isArray(arr) && arr.length) {
          item = arr.find((p: any) => String(p?.id) === id) || null;
        }
      } catch {}
    }

    item = normalizeRef(item);

    if (!item) {
      return res.status(404).json({ ok: false, error: "Not Found" });
    }
    return res.status(200).json({ ok: true, item });
  } catch (e) {
    console.error("GET /api/properties/[id] error:", e);
    return res.status(500).json({ ok: false, error: "Internal Server Error" });
  }
}
