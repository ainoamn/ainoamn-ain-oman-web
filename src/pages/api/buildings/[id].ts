// src/pages/api/buildings/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";

type Unit = {
  id: string;
  unitNo: string;
  rentAmount?: number;
  currency?: string;
  status?: "vacant" | "reserved" | "leased";
  published?: boolean;
  image?: string;
  waterMeter?: string;
  powerMeter?: string;
  images?: string[];
  features?: string[];
};
type Building = {
  id: string;
  buildingNo: string;
  address: string;
  images?: string[];
  coverIndex?: number;
  published?: boolean;
  archived?: boolean;
  services?: any;
  units: Unit[];
  createdAt: string;
  updatedAt: string;
};
type DB = { buildings: Building[] };

// @ts-ignore
global.__AIN_DB__ = global.__AIN_DB__ || ({ buildings: [] } as DB);
const db: DB = global.__AIN_DB__;

function send404(res: NextApiResponse) { res.status(404).json({ error: "not found" }); }
function now() { return new Date().toISOString(); }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const raw = String(req.query.id || "");
  const b = db.buildings.find(x => x.id === raw || x.buildingNo === raw);
  if (!b) return send404(res);

  if (req.method === "GET") {
    return res.json({ item: b });
  }

  if (req.method === "PATCH") {
    const body = req.body || {};

    // أوامر واضحة
    if (body.op === "publishBuilding") {
      b.published = !!body.published;
      b.updatedAt = now();
      return res.json({ ok: true, item: b });
    }

    // نشر وحدة بالـ id
    if (body.op === "publishUnit") {
      const u = b.units.find(u => u.id === body.unitId);
      if (!u) return res.status(400).json({ error: "unit not found" });
      u.published = !!body.published;
      b.updatedAt = now();
      return res.json({ ok: true, item: b });
    }

    // نشر وحدة بالرقم لتفادي تكرار المعرّفات
    if (body.op === "publishUnitByNo") {
      const u = b.units.find(u => u.unitNo === body.unitNo);
      if (!u) return res.status(400).json({ error: "unit not found" });
      u.published = !!body.published;
      b.updatedAt = now();
      return res.json({ ok: true, item: b });
    }

    if (body.op === "archive") {
      b.archived = !!body.archived;
      if (b.archived) b.published = false;
      b.updatedAt = now();
      return res.json({ ok: true, item: b });
    }

    // تحديث حقول مباشرة
    const { buildingNo, address, images, coverIndex, published, archived, services, units } = body;

    if (typeof buildingNo === "string") b.buildingNo = buildingNo;
    if (typeof address === "string") b.address = address;
    if (Array.isArray(images)) b.images = images;
    if (typeof coverIndex === "number") b.coverIndex = coverIndex;
    if (typeof published === "boolean") b.published = published;
    if (typeof archived === "boolean") { b.archived = archived; if (archived) b.published = false; }
    if (services && typeof services === "object") b.services = { ...b.services, ...services };

    if (Array.isArray(units)) {
      // حافظ على المعرفات. إن تكررت عالجها بإعادة توليد فريد.
      const seen = new Set<string>();
      b.units = units.map((u: Unit, i: number) => {
        let id = u.id || `U-${u.unitNo || i + 1}-${Date.now()}-${i}`;
        if (seen.has(id)) id = `U-${u.unitNo || i + 1}-${Date.now()}-${i}`;
        seen.add(id);
        const old = b.units.find(x => x.id === u.id) || {} as Unit;
        return { ...old, ...u, id };
      });
    }

    b.updatedAt = now();
    return res.json({ ok: true, item: b });
  }

  if (req.method === "DELETE") {
    const idx = db.buildings.findIndex(x => x.id === raw || x.buildingNo === raw);
    if (idx >= 0) db.buildings.splice(idx, 1);
    return res.json({ ok: true });
  }

  res.setHeader("Allow", "GET,PATCH,DELETE");
  res.status(405).end();
}
