import type { NextApiRequest, NextApiResponse } from "next";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
const DATA = path.join(process.cwd(), ".data");
const FILE = path.join(DATA, "features.json");

type Feature = { key: string; enabled: boolean; requiresSubscription: boolean; minPlan?: string|null };
type Store = { items: Feature[] };

async function ensure(){ try{await access(DATA)}catch{await mkdir(DATA,{recursive:true})} try{await access(FILE)}catch{await writeFile(FILE,JSON.stringify({items:[]},null,2),"utf8")} }
async function readDB():Promise<Store>{ const raw=await readFile(FILE,"utf8").catch(()=> '{"items":[]}'); try{ return JSON.parse(raw||'{"items":[]}'); }catch{ return { items: [] }; } }
async function writeDB(d:Store){ await writeFile(FILE, JSON.stringify(d,null,2), "utf8"); }

function seed(): Store {
  return {
    items: [
      { key:"auctions",        enabled:true,  requiresSubscription:true,  minPlan:"pro" },
      { key:"featuredAds",     enabled:true,  requiresSubscription:true,  minPlan:"pro" },
      { key:"buySell",         enabled:true,  requiresSubscription:false, minPlan:null },
      { key:"realEstateDev",   enabled:false, requiresSubscription:true,  minPlan:"business" },
      { key:"tasks",           enabled:true,  requiresSubscription:false, minPlan:null },
    ],
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  await ensure();

  if (req.method === "GET") {
    let db = await readDB();
    if (!db.items || db.items.length === 0) { db = seed(); await writeDB(db); }
    return res.status(200).json(db);
  }

  if (req.method === "PUT") {
    const b = req.body as Store;
    if (!b || !Array.isArray(b.items)) return res.status(400).json({ error:"items required" });
    await writeDB({ items: b.items });
    return res.status(200).json({ ok:true });
  }

  if (req.method === "PATCH") {
    const b = req.body as Partial<Feature> & { key: string };
    if (!b?.key) return res.status(400).json({ error:"key required" });
    const db = await readDB();
    const i = (db.items||[]).findIndex(x=> x.key === b.key);
    if (i === -1) db.items.push({ key:b.key, enabled: !!b.enabled, requiresSubscription: !!b.requiresSubscription, minPlan: b.minPlan ?? null });
    else db.items[i] = { ...db.items[i], ...b };
    await writeDB(db);
    return res.status(200).json({ ok:true });
  }

  res.setHeader("Allow","GET, PUT, PATCH");
  return res.status(405).json({ error:"Method Not Allowed" });
}
