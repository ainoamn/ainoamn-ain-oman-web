import type { NextApiRequest, NextApiResponse } from "next";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

const DATA = path.join(process.cwd(), ".data");
const SUBS = path.join(DATA, "subscriptions.json");
const TASKS = path.join(DATA, "tasks.json");
const NOTIFS = path.join(DATA, "notifications.json");
const PLANS = path.join(DATA, "plans.json");

async function ensure(){ try{await access(DATA)}catch{await mkdir(DATA,{recursive:true})}
  for(const f of [SUBS,TASKS,NOTIFS,PLANS]){ try{await access(f)}catch{await writeFile(f,JSON.stringify({items:[]},null,2),"utf8")} } }
async function readJSON(p:string){ const raw=await readFile(p,"utf8").catch(()=> '{"items":[]}'); return JSON.parse(raw||'{"items":[]}'); }
async function writeJSON(p:string, d:any){ await writeFile(p, JSON.stringify(d,null,2),"utf8"); }
function addPeriodFromPlan(start:number, plan:any){ const d=new Date(start); if(plan?.period==="/yr") d.setFullYear(d.getFullYear()+1); else d.setMonth(d.getMonth()+1); return d.getTime(); }

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  await ensure();
  const { id } = req.query as { id:string };
  if(req.method!=="PUT"){ res.setHeader("Allow","PUT"); return res.status(405).json({ error:"Method Not Allowed" }); }

  const subs=await readJSON(SUBS);
  const items=subs.items||[];
  const i=items.findIndex((s:any)=> s.id===id);
  if(i===-1) return res.status(404).json({ error:"Not found" });

  const before=items[i];
  const body=req.body||{};
  const after={ ...before, ...body, id };

  // إذا تحولت إلى active تحقق من السعة وحدد التواريخ إن لزم
  if(after.state==="active"){
    const plans=await readJSON(PLANS);
    const plan=(plans.items||[]).find((p:any)=> p.id===after.planId);
    const stockLimit = (plan?.stockLimit===null || plan?.stockLimit===undefined) ? null : Number(plan.stockLimit);
    if(Number.isFinite(stockLimit)){
      const now=Date.now();
      const activeCount=(items||[]).filter((s:any)=> s.id!==id && s.planId===after.planId && s.state==="active" && s.endAt && Number(s.endAt)>now).length;
      if(activeCount >= Number(stockLimit)) return res.status(409).json({ error:"plan stock limit reached" });
    }
    if(!after.startAt){ const start=Date.now(); after.startAt=start; after.endAt=after.endAt||addPeriodFromPlan(start, plan); }
    if(!after.endAt && after.startAt){ after.endAt=addPeriodFromPlan(after.startAt, plan); }
  }

  // تطبيع التواريخ إذا أُرسلت قيم غير رقمية
  if(typeof after.startAt!=="number" && after.startAt!==null) after.startAt=before.startAt??null;
  if(typeof after.endAt!=="number" && after.endAt!==null) after.endAt=before.endAt??null;

  items[i]=after;
  await writeJSON(SUBS,{ items });

  if(before.state!==after.state){
    const tasks=await readJSON(TASKS);
    tasks.items=(tasks.items||[]).map((t:any)=> t.linked?.type==="subscription"&&t.linked?.id===id? { ...t, status:"done" } : t);
    await writeJSON(TASKS,tasks);

    const notifs=await readJSON(NOTIFS);
    const msg= after.state==="active" ? `تم تفعيل اشتراكك (${after.serial})` :
               after.state==="declined"? `تم رفض اشتراكك (${after.serial})` :
               after.state==="banned"  ? `تم حظر اشتراكك (${after.serial})` :
                                         `تحديث حالة اشتراكك (${after.serial})`;
    notifs.items=[{ id:`ntf_${Date.now()}`, userId:after.userId, title:"تحديث الاشتراك", body:msg, read:false, createdAt:Date.now() }, ...(notifs.items||[])];
    await writeJSON(NOTIFS,notifs);
  }

  return res.status(200).json({ ok:true, item:after });
}
