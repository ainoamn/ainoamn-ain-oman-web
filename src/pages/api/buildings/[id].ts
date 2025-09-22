// src/pages/api/buildings/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { readJson, writeJson } from "@/lib/fsdb";
import type { Building } from "@/lib/types";

const FILE = "buildings.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = String(req.query.id || "");
  const items = await readJson<Building[]>(FILE, []);
  const idx = items.findIndex(x=>x.id===id || x.buildingNo===id);
  if (idx === -1) {
    if (req.method === "GET") return res.status(404).json({ error: "Not Found" });
  }

  if (req.method === "GET") return res.status(200).json({ item: items[idx] });

  if (req.method === "PATCH" || req.method === "PUT") {
    try{
      const b = req.body || {};
      if (idx === -1) return res.status(404).json({ error: "Not Found" });
      const cur = items[idx];
      const next: Building = {
        ...cur,
        ...b,
        units: Array.isArray(b.units) ? b.units : cur.units,
        updatedAt: new Date().toISOString(),
      };
      items[idx] = next;
      await writeJson(FILE, items);
      return res.status(200).json({ item: next });
    }catch(e:any){ return res.status(400).json({ error: e?.message || "Bad Request" }); }
  }

  res.setHeader("Allow","GET,PUT,PATCH");
  return res.status(405).json({ error: "Method Not Allowed" });
}
