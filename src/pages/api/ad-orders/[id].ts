import type { NextApiRequest, NextApiResponse } from "next";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

const DATA = path.join(process.cwd(), ".data");
const ORDERS = path.join(DATA, "ad-orders.json");
const TASKS = path.join(DATA, "tasks.json");
const NOTIFS = path.join(DATA, "notifications.json");
const PRODUCTS = path.join(DATA, "ad-products.json");

async function ensure(){ try{await access(DATA)}catch{await mkdir(DATA,{recursive:true})}
  for (const f of [ORDERS,TASKS,NOTIFS,PRODUCTS]) { try{await access(f)}catch{await writeFile(f,JSON.stringify({items:[]},null,2),"utf8")} } }
async function readJSON(p:string){ const raw=await readFile(p,"utf8").catch(()=> '{"items":[]}'); return JSON.parse(raw||'{"items":[]}'); }
async function writeJSON(p:string, d:any){ await writeFile(p, JSON.stringify(d,null,2), "utf8"); }
function durationFor(products:any[], id:string){ const p=(products||[]).find((x:any)=> x.id===id); return Number.isFinite(p?.durationDays)? Number(p.durationDays):0; }

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  await ensure();
  const { id } = req.query as { id: string };
  if (req.method !== "PUT") { res.setHeader("Allow","PUT"); return res.status(405).json({ error:"Method Not Allowed" }); }

  const ords = await readJSON(ORDERS);
  const items = ords.items||[];
  const i = items.findIndex((o:any)=> o.id===id);
  if (i===-1) return res.status(404).json({ error:"Not found" });

  const before = items[i];
  const body = req.body || {};
  const after = { ...before, ...body, id };

  // عند الموافقة ولم تُحدد تواريخ، احسب النهاية من المنتج
  if (after.state === "approved" && (!after.startAt || !after.endAt)) {
    const products = await readJSON(PRODUCTS);
    const days = durationFor(products.items||[], after.adProductId);
    const start = Date.now();
    const end = start + days*24*60*60*1000;
    after.startAt = start; after.endAt = end;
  }

  items[i] = after;
  await writeJSON(ORDERS, { items });

  if (before.state !== after.state) {
    const tasks = await readJSON(TASKS);
    tasks.items = (tasks.items||[]).map((t:any)=> t.linked?.type==="ad" && t.linked?.id===id ? { ...t, status:"done" } : t);
    await writeJSON(TASKS, tasks);

    const notifs = await readJSON(NOTIFS);
    const msg =
      after.state === "approved" ? `تمت الموافقة على إعلانك (${after.serial})` :
      after.state === "rejected" ? `تم رفض إعلانك (${after.serial})` :
      `تحديث حالة إعلانك (${after.serial})`;
    notifs.items = [{ id:`ntf_${Date.now()}`, userId:after.userId, title:"تحديث الإعلان", body:msg, read:false, createdAt:Date.now() }, ...(notifs.items||[])];
    await writeJSON(NOTIFS, notifs);
  }

  return res.status(200).json({ ok:true, item: after });
}
