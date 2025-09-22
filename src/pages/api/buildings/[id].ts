// src/pages/api/buildings/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";

// مخزن بسيط في الذاكرة (استبدله بقاعدة البيانات لديك)
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
  services?: {
    powerMeter?: string; powerImage?: string; powerVisibility?: "private"|"public"|"tenant";
    waterMeter?: string; waterImage?: string; waterVisibility?: "private"|"public"|"tenant";
    phoneMeter?: string; phoneImage?: string; phoneVisibility?: "private"|"public"|"tenant";
    others?: { label:string; value:string; image?:string; visibility:"private"|"public"|"tenant" }[];
  };
  units: Unit[];
  createdAt: string;
  updatedAt: string;
};
type DB = { buildings: Building[] };

// @ts-ignore
global.__AIN_DB__ = global.__AIN_DB__ || ({ buildings: [] } as DB);
const db: DB = global.__AIN_DB__;

function send404(res:NextApiResponse){ res.status(404).json({ error:"not found" }); }
function now(){ return new Date().toISOString(); }

export default async function handler(req:NextApiRequest, res:NextApiResponse){
  const id = String(req.query.id||"");
  const b = db.buildings.find(x=>x.id===id);
  if(!b){ return send404(res); }

  if(req.method==="GET"){
    return res.json({ item: b });
  }

  if(req.method==="PATCH"){
    const body = req.body || {};
    // عمليات نشر/أرشفة منفصلة لتفادي تأثيرها على جميع الوحدات
    if(body.op==="publishBuilding"){
      b.published = !!body.published;
      b.updatedAt = now();
      return res.json({ ok:true, item:b });
    }
    if(body.op==="publishUnit"){
      const u = b.units.find(u=>u.id===body.unitId);
      if(!u) return res.status(400).json({ error:"unit not found" });
      u.published = !!body.published;
      b.updatedAt = now();
      return res.json({ ok:true, item:b });
    }
    if(body.op==="archive"){
      b.archived = !!body.archived;
      if(b.archived) b.published = false;
      b.updatedAt = now();
      return res.json({ ok:true, item:b });
    }

    // تحديث شامل لبيانات المبنى + الوحدات
    const {
      buildingNo, address, images, coverIndex, published, archived, services, units
    } = body;

    if(typeof buildingNo==="string") b.buildingNo = buildingNo;
    if(typeof address==="string") b.address = address;
    if(Array.isArray(images)) b.images = images;
    if(typeof coverIndex==="number") b.coverIndex = coverIndex;
    if(typeof published==="boolean") b.published = published;
    if(typeof archived==="boolean") { b.archived = archived; if(archived) b.published=false; }
    if(services && typeof services==="object") b.services = { ...b.services, ...services };

    // تحديث الوحدات: يطابق بالمعرّف، أو يضيف الجديدة
    if(Array.isArray(units)){
      const map = new Map<string,Unit>(b.units.map(u=>[u.id,u]));
      const next: Unit[] = [];
      for(const u of units as Unit[]){
        if(map.has(u.id)){
          const old = map.get(u.id)!;
          next.push({ ...old, ...u, id: old.id });
        }else{
          next.push({ ...u });
        }
      }
      b.units = next;
    }

    b.updatedAt = now();
    return res.json({ ok:true, item:b });
  }

  if(req.method==="DELETE"){
    const idx = db.buildings.findIndex(x=>x.id===id);
    if(idx>=0) db.buildings.splice(idx,1);
    return res.json({ ok:true });
  }

  res.setHeader("Allow","GET,PATCH,DELETE");
  return res.status(405).end();
}
