// src/pages/api/property/[id]/units.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { readJson } from "@/server/fsdb";

type Unit = { id: string; name: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const id = String(req.query.id || "");
  try {
    const list = await readJson<any[]>("properties", []);
    let prop = list.find((p: any) => String(p?.id) === id) || null;

    if (!prop) {
      try {
        const mod: any = await import("@/lib/demoData").catch(() => ({}));
        const arr: any[] = mod?.PROPERTIES || mod?.properties || mod?.default || [];
        prop = arr.find((p: any) => String(p?.id) === id) || null;
      } catch {}
    }

    let units: Unit[] = [];
    if (prop?.units && Array.isArray(prop.units)) {
      units = prop.units.map((u: any, i: number) => ({ id: String(u?.id || `U${i+1}`), name: String(u?.name || `الوحدة ${i+1}`) }));
    } else {
      units = [{ id: "U1", name: "الوحدة 1" }];
    }

    return res.status(200).json({ ok: true, items: units });
  } catch (e) {
    console.error("units error:", e);
    return res.status(500).json({ ok: false, error: "Internal Server Error" });
  }
}
