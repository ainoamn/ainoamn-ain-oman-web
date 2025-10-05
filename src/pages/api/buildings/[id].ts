// src/pages/api/buildings/[id].ts
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
  geo?: { landNo?:string; mapNo?:string; landUse?:string; blockNo?:string; buildingSerial?:string; roadNo?:string; province?:string; state?:string; city?:string; village?:string; municipality?:string; buildingArea?:number; };
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

function send404(res: NextApiResponse) { res.status(404).json({ error: "not found" }); }
function now() { return new Date().toISOString(); }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const raw = String(req.query.id || "");
  const b = db.buildings.find(x => x.id === raw || x.buildingNo === raw);
  if (!b) return send404(res);

  if (req.method === "GET") return res.json({ item: b });

  if (req.method === "PATCH") {
    const body = req.body || {};

    if (body.op === "publishBuilding") {
      b.published = !!body.published; b.updatedAt = now();
      return res.json({ ok: true, item: b });
    }
    if (body.op === "publishUnit") {
      const u = b.units.find(u => u.id === body.unitId);
      if (!u) return res.status(400).json({ error: "unit not found" });
      u.published = !!body.published; b.updatedAt = now();
      return res.json({ ok: true, item: b });
    }
    if (body.op === "publishUnitByNo") {
      const u = b.units.find(u => u.unitNo === body.unitNo);
      if (!u) return res.status(400).json({ error: "unit not found" });
      u.published = !!body.published; b.updatedAt = now();
      return res.json({ ok: true, item: b });
    }
    if (body.op === "archive") {
      b.archived = !!body.archived; if (b.archived) b.published = false; b.updatedAt = now();
      return res.json({ ok: true, item: b });
    }

    const { buildingNo, address, images, coverIndex, published, archived, services, units, geo, licenses, owner, agent, workflow } = body;
    if (typeof buildingNo === "string") b.buildingNo = buildingNo;
    if (typeof address === "string") b.address = address;
    if (Array.isArray(images)) b.images = images;
    if (typeof coverIndex === "number") b.coverIndex = coverIndex;
    if (typeof published === "boolean") b.published = published;
    if (typeof archived === "boolean") { b.archived = archived; if (archived) b.published = false; }
    if (services && typeof services === "object") b.services = { ...b.services, ...services };
    if (geo && typeof geo === "object") b.geo = { ...(b.geo||{}), ...geo };
    if (Array.isArray(licenses)) b.licenses = licenses;
    if (owner && typeof owner === "object") b.owner = owner;
    if (agent && typeof agent === "object") b.agent = agent;

    if (Array.isArray(units)) {
      const map = new Map(b.units.map(u => [u.id, u]));
      b.units = units.map((u: Unit, i:number) => {
        const old = u.id && map.get(u.id);
        const id = old?.id || u.id || `U-${Date.now()}-${i}`;
        return { ...old, ...u, id };
      });
    }

    if (Array.isArray(workflow)) b.workflow = workflow;

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
