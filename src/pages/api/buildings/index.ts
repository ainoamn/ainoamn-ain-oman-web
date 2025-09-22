// src/pages/api/buildings/index.ts
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

function now() { return new Date().toISOString(); }
function uid(prefix: string) { return `${prefix}-${Date.now()}`; }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // دعم التصفية البسيطة: ?published=1&archived=0
    const { published, archived } = req.query;
    let items = db.buildings.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    if (published === "1") items = items.filter(b => !!b.published);
    if (published === "0") items = items.filter(b => !b.published);
    if (archived === "1") items = items.filter(b => !!b.archived);
    if (archived === "0") items = items.filter(b => !b.archived);
    return res.json({ items });
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const building: Building = {
      id: body.id || uid("BLD"),
      buildingNo: body.buildingNo || "",
      address: body.address || "",
      images: Array.isArray(body.images) ? body.images : [],
      coverIndex: typeof body.coverIndex === "number" ? body.coverIndex : 0,
      published: !!body.published,
      archived: !!body.archived,
      services: body.services || {},
      units: Array.isArray(body.units) ? body.units : [],
      createdAt: now(),
      updatedAt: now(),
    };
    db.buildings.push(building);
    return res.status(201).json({ item: building });
  }

  if (req.method === "PATCH") {
    // تحديث جماعي سريع عبر buildingNo أو id
    const { id, buildingNo } = req.body || {};
    const item = db.buildings.find(b => (id && b.id === id) || (buildingNo && b.buildingNo === buildingNo));
    if (!item) return res.status(404).json({ error: "not found" });
    Object.assign(item, req.body);
    item.updatedAt = now();
    return res.json({ item });
  }

  res.setHeader("Allow", "GET,POST,PATCH");
  res.status(405).end();
}
