// src/pages/api/buildings/index.ts
import type { NextApiRequest, NextApiResponse } from "next";

type ExtraRow = { label:string; value:string; image?:string; visibility:"private"|"public"|"tenant" };
type License = { id:string; kind:string; number:string; expiry:string; attachment?:string };
type PersonDoc = { id:string; docType:string; docNumber:string; attachment?:string; expiry?:string };
type Party = {
  category:"فرد"|"شركة";
  nationalIdOrCR:string;
  nameAr:string; nameEn:string; email:string; phone:string; address:string;
  docs:PersonDoc[];
  agencyNumber?:string; agencyExpiry?:string; agencyAttachment?:string;
};
type Unit = {
  id: string; unitNo: string; serialNo?:string; type?:string; area?:number;
  rentAmount?: number; currency?: string;
  status?: "vacant" | "reserved" | "leased";
  published?: boolean; image?: string;
  waterMeter?: string; powerMeter?: string;
  images?: string[]; features?: string[];
};
type Step = { id:string; name:string; status:"pending"|"in_progress"|"done"|"rejected"; date?:string; owner?:string; notes?:string; };

type Building = {
  id: string;
  buildingNo: string;
  address: string;
  images?: string[];
  coverIndex?: number;
  published?: boolean;
  archived?: boolean;

  // إضافات جديدة
  geo?: {
    landNo?:string; mapNo?:string; landUse?:string; blockNo?:string; buildingSerial?:string; roadNo?:string;
    province?:string; state?:string; city?:string; village?:string; municipality?:string;
    buildingArea?:number;
  };
  licenses?: License[];
  services?: {
    powerMeter?: string; powerImage?: string; powerVisibility?: "private"|"public"|"tenant";
    waterMeter?: string; waterImage?: string; waterVisibility?: "private"|"public"|"tenant";
    phoneMeter?: string; phoneImage?: string; phoneVisibility?: "private"|"public"|"tenant";
    others?: ExtraRow[];
  };
  owner?: Party;
  agent?: Party;

  units: Unit[];
  workflow?: Step[];

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
      geo: body.geo || {},
      licenses: Array.isArray(body.licenses)? body.licenses : [],
      services: body.services || {},
      owner: body.owner || undefined,
      agent: body.agent || undefined,
      units: Array.isArray(body.units) ? body.units : [],
      workflow: Array.isArray(body.workflow)? body.workflow : [],
      createdAt: now(),
      updatedAt: now(),
    };
    db.buildings.push(building);
    return res.status(201).json({ item: building });
  }

  if (req.method === "PATCH") {
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
