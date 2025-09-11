import type { NextApiRequest, NextApiResponse } from "next";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

const DATA = path.join(process.cwd(), ".data");
const SUBS = path.join(DATA, "subscriptions.json");
const TASKS = path.join(DATA, "tasks.json");
const NOTIFS = path.join(DATA, "notifications.json");
const PLANS = path.join(DATA, "plans.json");
const COUPS = path.join(DATA, "coupons.json");
const CNTRS = path.join(DATA, "counters.json");
const USERS = path.join(DATA, "users.json");

type SubState = "pending" | "active" | "declined" | "banned";
type Period = "/mo" | "/yr";
type Discount = { code?: string; type?: string; value?: number; percentOff?: number; amountOff?: number };
type Sub = {
  id:string; serial:string; userId:string; name:string; planId:string; state:SubState;
  startAt:number|null; endAt:number|null; promoted:boolean; priceOMR:number;
  discount?:Discount|null; finalPriceOMR:number; createdAt:number; billingPeriod:Period;
  payment:{ method:string; status:"paid"|"pending"|"failed" };
};

function parseCookies(h?: string) {
  const out: Record<string, string> = {};
  if (!h) return out;
  for (const p of h.split(";")) { const [k, ...r] = p.trim().split("="); out[k] = decodeURIComponent((r.join("=") || "").trim()); }
  return out;
}
function getUser(req: NextApiRequest) {
  const h = req.headers["x-user-id"];
  if (typeof h === "string" && h) return { id: h, name: (req.headers["x-user-name"] as string) || "User" };
  const c = parseCookies(req.headers.cookie);
  if (c.uid) return { id: c.uid, name: c.uname || "User" };
  return null;
}

async function ensure(){ try{await access(DATA)}catch{await mkdir(DATA,{recursive:true})}
  for(const f of [SUBS,TASKS,NOTIFS,PLANS,COUPS,CNTRS,USERS]){ try{await access(f)}catch{await writeFile(f,JSON.stringify({items:[]},null,2),"utf8")} } }
async function readJSON<T=any>(p:string):Promise<T>{ const raw=await readFile(p,"utf8").catch(()=> '{"items":[]}'); return JSON.parse(raw||'{"items":[]}'); }
async function writeJSON(p:string, d:any){ await writeFile(p, JSON.stringify(d,null,2),"utf8"); }

async function nextSerial(prefix="SUB"){
  const y=new Date().getFullYear(); const key=`${prefix}-${y}`;
  const raw=await readFile(CNTRS,"utf8").catch(()=> "{}");
  const obj=(()=>{try{return JSON.parse(raw||"{}")}catch{return{}}})(); 
  const n=(obj[key]||0)+1; obj[key]=n;
  await writeFile(CNTRS, JSON.stringify(obj,null,2),"utf8");
  return `${key}-${String(n).padStart(6,"0")}`;
}
function priceForPlan(plans:any[], planId:string){ const p=(plans||[]).find((x:any)=> x.id===planId); return Number.isFinite(p?.priceOMR)? Number(p.priceOMR):0; }
function addMonths(t:number, m:number){ const d=new Date(t); d.setMonth(d.getMonth()+m); return d.getTime(); }
function addYears(t:number, y:number){ const d=new Date(t); d.setFullYear(d.getFullYear()+y); return d.getTime(); }
function applyCoupon(base:number, planId:string, c:any){
  if(!c) return { discount:null, final:base };
  let final=base, percentOff=0, amountOff=0;
  if(Array.isArray(c.targets?.plans) && c.targets.plans.length && !c.targets.plans.includes(planId)) return { discount:null, final:base };
  if(c.expiresAt && Date.now()>Number(c.expiresAt)) return { discount:null, final:base };
  if(c.type==="percent"){ percentOff=Math.max(0,Math.min(100,Number(c.value))); final=base*(1-percentOff/100); }
  else if(c.type==="amount"){ amountOff=Math.max(0,Number(c.value)); final=Math.max(0,base-amountOff); }
  return { discount:{ code:c.code, type:c.type, value:c.value, percentOff, amountOff }, final:Number(final.toFixed(3)) };
}

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  await ensure();

  if(req.method==="GET"){
    const { userId, scan } = req.query as { userId?:string; scan?:string };
    const subs=await readJSON<{items:Sub[]}>(SUBS);
    let items=(subs.items||[]).slice().sort((a,b)=> b.createdAt-a.createdAt);

    // حساب المتبقي + توليد مهام/تنبيهات قرب الانتهاء عند الطلب
    const now=Date.now();
    const withRemain = items.map(s=> ({ ...s, remainingMs: s.endAt? Math.max(0, s.endAt-now) : null as number|null }));
    if (scan) {
      const tasks=await readJSON<{items:any[]}>(TASKS);
      const notifs=await readJSON<{items:any[]}>(NOTIFS);
      const soon = withRemain.filter(s=> s.state==="active" && s.endAt && s.endAt>now && s.endAt-now <= 7*24*60*60*1000);
      let tItems = tasks.items||[], nItems = notifs.items||[];
      for (const s of soon) {
        const exists = tItems.some((t:any)=> t.linked?.type==="subscription_expiry" && t.linked?.id===s.id);
        if (!exists) {
          const tid=`task_${Date.now()}_${s.id}`;
          tItems=[{ id:tid, title:`اشتراك يوشك على الانتهاء (${s.serial})`, description:`انتهاء: ${new Date(s.endAt!).toLocaleString()}`, status:"open", linked:{ type:"subscription_expiry", id:s.id } }, ...tItems];
          nItems=[{ id:`ntf_${Date.now()}_${s.id}`, userId:s.userId, title:"تذكير انتهاء الاشتراك", body:`سينتهي اشتراكك (${s.serial}) قريبًا`, read:false, createdAt:Date.now() }, ...nItems];
        }
      }
      await writeJSON(TASKS, { items:tItems });
      await writeJSON(NOTIFS, { items:nItems });
      return res.status(200).json({ items: withRemain });
    }

    if(userId) return res.status(200).json({ items: withRemain.filter(s=> s.userId===userId) });
    return res.status(200).json({ items: withRemain });
  }

  if(req.method==="POST"){
    // يتطلب تسجيل دخول
    const sessionUser = getUser(req);
    if(!sessionUser) return res.status(401).json({ error:"auth_required" });

    const b = req.body as { planId:string; couponCode?:string; billingPeriod?:Period; payment?:{method:string;status:"paid"|"pending"|"failed"} };
    if(!b?.planId) return res.status(400).json({ error:"planId required" });

    const users=await readJSON<{items:any[]}>(USERS);
    const u = (users.items||[]).find(x=> x.id===sessionUser.id);
    if(u?.status==="banned") return res.status(403).json({ error:"user banned" });
    if(!u){ users.items=[{ id:sessionUser.id, name:sessionUser.name, status:"active", createdAt:Date.now() }, ...(users.items||[])]; await writeJSON(USERS, users); }

    const serial=await nextSerial("SUB");
    const plans=await readJSON<{items:any[]}>(PLANS);
    const base=priceForPlan(plans.items||[], b.planId);

    let discount:Discount|null=null, final=base;
    if(b.couponCode){
      const coups=await readJSON<{items:any[]}>(COUPS);
      const c=(coups.items||[]).find(x=> String(x.code||"").toLowerCase() === String(b.couponCode).toLowerCase());
      if(c){ const d=applyCoupon(base, b.planId, c); discount=d.discount; final=d.final;
        if(d.discount){ c.redeemed=(Number(c.redeemed)||0)+1; await writeJSON(COUPS,{ items:(coups.items||[]).map(x=> x.code===c.code? c:x) }); }
      }
    }

    const billingPeriod:Period = b.billingPeriod==="/yr"? "/yr" : "/mo";
    const payment = { method:b.payment?.method||"online", status: b.payment?.status||"pending" };

    // إعداد الحالة والتواريخ حسب الدفع
    let state:SubState = payment.status==="paid" ? "active":"pending";
    let startAt:number|null = null, endAt:number|null = null;

    // تحقق السعة عند التفعيل الفوري
    if (state==="active") {
      const subs=await readJSON<{items:Sub[]}>(SUBS);
      const now=Date.now();
      const plan=(plans.items||[]).find((p:any)=> p.id===b.planId);
      const stockLimit = (plan?.stockLimit===null || plan?.stockLimit===undefined)? null : Number(plan?.stockLimit);
      if(Number.isFinite(stockLimit)){
        const activeCount=(subs.items||[]).filter(s=> s.planId===b.planId && s.state==="active" && s.endAt && Number(s.endAt)>now).length;
        if(activeCount >= Number(stockLimit)) return res.status(409).json({ error:"plan stock limit reached" });
      }
      startAt = Date.now();
      endAt = billingPeriod==="/yr"? addYears(startAt,1) : addMonths(startAt,1);
    }

    const item:Sub = {
      id:`sub_${Date.now()}`, serial,
      userId:sessionUser.id, name:sessionUser.name,
      planId:b.planId, state, startAt, endAt, promoted:false,
      priceOMR:base, discount, finalPriceOMR:final, createdAt:Date.now(),
      billingPeriod, payment
    };

    const subs=await readJSON<{items:Sub[]}>(SUBS);
    subs.items=[item, ...(subs.items||[])];
    await writeJSON(SUBS, subs);

    const tasks=await readJSON<{items:any[]}>(TASKS);
    const notifs=await readJSON<{items:any[]}>(NOTIFS);
    if(state==="active"){
      notifs.items=[{ id:`ntf_${Date.now()}`, userId:item.userId, title:"تم تفعيل الاشتراك", body:`(${item.serial})`, read:false, createdAt:Date.now() }, ...(notifs.items||[])];
    }else{
      tasks.items=[{ id:`task_${Date.now()}`, title:`مراجعة اشتراك ${serial}`, description:`${item.name} (${item.userId}) — ${item.planId}`, status:"open", linked:{type:"subscription", id:item.id} }, ...(tasks.items||[])];
      notifs.items=[{ id:`ntf_${Date.now()}`, userId:item.userId, title:"تم استلام طلب الاشتراك", body:`رقم الطلب: ${serial}`, read:false, createdAt:Date.now() }, ...(notifs.items||[])];
    }
    await writeJSON(TASKS,tasks); await writeJSON(NOTIFS,notifs);

    return res.status(201).json({ ok:true, item });
  }

  res.setHeader("Allow","GET, POST");
  return res.status(405).json({ error:"Method Not Allowed" });
}
