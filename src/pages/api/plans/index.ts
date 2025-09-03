import type { NextApiRequest, NextApiResponse } from "next";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "plans.json");

type Period = "/mo" | "/yr";
export type Plan = {
  id:string; name:string; priceOMR:number; period:Period; highlight?:boolean; description?:string; icon?:string;
  capabilities?:Record<string,any>;
  stockLimit?: number|null; // جديد: حد أقصى للاشتراكات النشطة في نفس الوقت
};

async function ensure(){ try{await access(DATA_DIR)}catch{await mkdir(DATA_DIR,{recursive:true})} try{await access(FILE)}catch{await writeFile(FILE, JSON.stringify({items:[]},null,2),"utf8")} }
function normalize(p:any):Plan{
  return {
    id:String(p.id),
    name:String(p.name||""),
    priceOMR:Number.isFinite(p.priceOMR)? Number(p.priceOMR):0,
    period: p.period==="/yr"? "/yr": "/mo",
    highlight: !!p.highlight,
    description: typeof p.description==="string"? p.description: "",
    icon: typeof p.icon==="string"? p.icon: "",
    capabilities: p.capabilities&&typeof p.capabilities==="object"? p.capabilities: {},
    stockLimit: (p.stockLimit===null || Number.isFinite(p.stockLimit)) ? (p.stockLimit===null? null: Number(p.stockLimit)) : null,
  };
}

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  await ensure();

  if(req.method==="GET"){
    const raw=await readFile(FILE,"utf8").catch(()=> '{"items":[]}');
    const data=JSON.parse(raw||'{"items":[]}');
    return res.status(200).json({ items:(data.items||[]).map(normalize) });
  }

  if(req.method==="POST"){
    const body=req.body as Partial<Plan>;
    if(!body?.name) return res.status(400).json({ error:"name required" });

    const raw=await readFile(FILE,"utf8").catch(()=> '{"items":[]}');
    const data=JSON.parse(raw||'{"items":[]}');
    const id = body.id && String(body.id).trim()? String(body.id).trim(): `pln_${Date.now()}`;
    const item=normalize({ ...body, id });
    const items=[item, ...(data.items||[]).filter((p:any)=> String(p.id)!==id)];
    await writeFile(FILE, JSON.stringify({items},null,2),"utf8");
    return res.status(201).json({ ok:true, item });
  }

  res.setHeader("Allow","GET, POST");
  return res.status(405).json({ error:"Method Not Allowed" });
}
