// src/pages/api/buildings/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { readJson, writeJson, uid } from "@/lib/fsdb";
import type { Building, UnitInfo } from "@/lib/types";

const FILE = "buildings.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const items = await readJson<Building[]>(FILE, []);
    return res.status(200).json({ items });
  }
  if (req.method === "POST") {
    try{
      const b = req.body || {};
      const items = await readJson<Building[]>(FILE, []);
      const id = uid("BLD");
      const now = new Date().toISOString();
      const units: UnitInfo[] = Array.isArray(b.units) ? b.units : [];

      const item: Building = {
        id,
        buildingNo: String(b.buildingNo || ""),
        address: String(b.address || ""),
        unitsCount: Number(b.unitsCount || units.length || 0),
        units: units.map((u: any, i: number)=> ({
          id: u.id || uid("U"),
          unitNo: String(u.unitNo ?? (i+1).toString()),
          powerMeter: String(u.powerMeter||""),
          waterMeter: String(u.waterMeter||""),
          hasInternet: !!u.hasInternet,
          hasParking: !!u.hasParking,
          parkingCount: Number(u.parkingCount||0),
          area: Number(u.area||0),
          rooms: Number(u.rooms||0),
          baths: Number(u.baths||0),
          hall: Number(u.hall||0),
          type: (u.type || "apartment"),
          rentAmount: Number(u.rentAmount||0),
          currency: u.currency || "OMR",
          status: "vacant"
        })),
        published: !!b.published,
        createdAt: now,
        updatedAt: now,
      };
      const existsNo = items.find(x=>x.buildingNo===item.buildingNo);
      if (existsNo) return res.status(409).json({ error: "Building number already exists" });
      items.push(item);
      await writeJson(FILE, items);
      return res.status(201).json({ item });
    }catch(e:any){ return res.status(400).json({ error: e?.message || "Bad Request" }); }
  }
  res.setHeader("Allow","GET,POST");
  return res.status(405).json({ error: "Method Not Allowed" });
}
