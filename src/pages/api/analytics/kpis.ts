// src/pages/api/analytics/kpis.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs"; import path from "path";

function bPath(){ return path.join(process.cwd(),"data","buildings.json"); }
function pPath(){ return path.join(process.cwd(),"data","properties.json"); }
function read(path:string){ if(!fs.existsSync(path)) return []; try{ return JSON.parse(fs.readFileSync(path,"utf8")||"[]"); }catch{ return []; } }

export default function handler(req:NextApiRequest,res:NextApiResponse){
  const buildings:any[] = read(bPath());
  const properties:any[] = read(pPath());

  const totalBuildings = buildings.length;
  const totalUnits = buildings.reduce((acc,b)=> acc + (Array.isArray(b.units)? b.units.length: 0), 0);
  const publishedUnits = buildings.reduce((acc,b)=> acc + (Array.isArray(b.units)? b.units.filter((u:any)=>u.published).length: 0), 0);
  const occupancyRate = (() => {
    const leased = buildings.reduce((acc,b)=> acc + (Array.isArray(b.units)? b.units.filter((u:any)=>u.status==="leased").length: 0), 0);
    return totalUnits ? Math.round((leased / totalUnits) * 100) : 0;
  })();

  const avgRent = (() => {
    const rents:number[] = [];
    for (const b of buildings) for (const u of (b.units||[])) if (typeof u.rentAmount==="number") rents.push(u.rentAmount);
    return rents.length ? Math.round(rents.reduce((a,b)=>a+b,0) / rents.length) : 0;
  })();

  const kpis = { totalBuildings, totalUnits, publishedUnits, occupancyRate, avgRent, publicListings: properties.length };
  return res.status(200).json({ ok:true, kpis });
}
