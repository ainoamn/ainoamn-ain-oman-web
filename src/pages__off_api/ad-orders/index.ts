import type { NextApiRequest, NextApiResponse } from "next";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

const DATA = path.join(process.cwd(), ".data");
const ORDERS = path.join(DATA, "ad-orders.json");
const PRODUCTS = path.join(DATA, "ad-products.json");
const COUPS = path.join(DATA, "coupons.json");
const TASKS = path.join(DATA, "tasks.json");
const NOTIFS = path.join(DATA, "notifications.json");
const CNTRS = path.join(DATA, "counters.json");
const USERS = path.join(DATA, "users.json");

type State = "pending" | "approved" | "rejected";
type Discount = { code?: string; type?: string; value?: number; percentOff?: number; amountOff?: number };
type Order = {
  id: string; serial: string; userId: string; name: string; adProductId: string; state: State;
  startAt: number | null; endAt: number | null; priceOMR: number; discount?: Discount | null; finalPriceOMR: number; createdAt: number;
};

function parseCookies(h?: string) {
  const out: Record<string, string> = {};
  if (!h) return out; for (const p of h.split(";")) { const [k, ...r] = p.trim().split("="); out[k] = decodeURIComponent((r.join("=") || "").trim()); }
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
  for (const f of [ORDERS, PRODUCTS, COUPS, TASKS, NOTIFS, CNTRS, USERS]) { try{await access(f)}catch{await writeFile(f, JSON.stringify({items:[]},null,2), "utf8")} } }
async function readJSON(p:string){ const raw=await readFile(p,"utf8").catch(()=> '{"items":[]}'); return JSON.parse(raw||'{"items":[]}'); }
async function writeJSON(p:string, d:any){ await writeFile(p, JSON.stringify(d,null,2), "utf8"); }
async function nextSerial(prefix="AD"){ const y=new Date().getFullYear(); const key=`${prefix}-${y}`; const raw=await readFile(CNTRS,"utf8").catch(()=> "{}"); const obj=(()=>{try{return JSON.parse(raw||"{}")}catch{return{}}})(); const n=(obj[key]||0)+1; obj[key]=n; await writeFile(CNTRS, JSON.stringify(obj,null,2), "utf8"); return `${key}-${String(n).padStart(6,"0")}`; }
function priceFor(products:any[], id:string){ const p=(products||[]).find((x:any)=> x.id===id); return Number.isFinite(p?.priceOMR)? Number(p.priceOMR):0; }
function durationFor(products:any[], id:string){ const p=(products||[]).find((x:any)=> x.id===id); return Number.isFinite(p?.durationDays)? Number(p.durationDays):0; }

function applyCoupon(base:number, adProductId:string, c:any){ if(!c) return { discount:null, final:base };
  let final=base, percentOff=0, amountOff=0;
  if(Array.isArray(c.targets?.adProducts)&&c.targets.adProducts.length && !c.targets.adProducts.includes(adProductId)) return { discount:null, final:base };
  if(c.expiresAt && Date.now()>Number(c.expiresAt)) return { discount:null, final:base };
  if(c.type==="percent"){ percentOff=Math.max(0,Math.min(100,Number(c.value))); final=base*(1-percentOff/100); }
  else if(c.type==="amount"){ amountOff=Math.max(0,Number(c.value)); final=Math.max(0,base-amountOff); }
  return { discount:{ code:c.code, type:c.type, value:c.value, percentOff, amountOff }, final:Number(final.toFixed(3)) };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  await ensure();

  if (req.method === "GET") {
    const { userId } = req.query as { userId?: string };
    const db = await readJSON(ORDERS);
    let items: Order[] = db.items || [];
    if (userId) items = items.filter(o => o.userId === userId);
    items = items.sort((a,b)=> b.createdAt - a.createdAt);
    return res.status(200).json({ items });
  }

  if (req.method === "POST") {
    const sessionUser = getUser(req);
    if(!sessionUser) return res.status(401).json({ error:"auth_required" });

    const b = req.body as { name?: string; adProductId: string; couponCode?: string };
    if (!b?.adProductId) return res.status(400).json({ error:"adProductId required" });

    const udb = await readJSON(USERS);
    const u = (udb.items||[]).find((x:any)=> x.id===sessionUser.id);
    if(u?.status==="banned") return res.status(403).json({ error:"user banned" });
    if(!u){ udb.items=[{ id:sessionUser.id, name:sessionUser.name, status:"active", createdAt:Date.now() }, ...(udb.items||[])]; await writeJSON(USERS, udb); }

    const serial = await nextSerial("AD");
    const products = await readJSON(PRODUCTS);
    const base = priceFor(products.items||[], b.adProductId);
    const days = durationFor(products.items||[], b.adProductId);

    let discount: Discount|null = null; let final = base;
    if (b.couponCode) {
      const coups = await readJSON(COUPS);
      const c = (coups.items||[]).find((x:any)=> String(x.code||"").toLowerCase() === String(b.couponCode).toLowerCase());
      if (c) {
        const d = applyCoupon(base, b.adProductId, c);
        discount = d.discount; final = d.final;
        if (discount) { c.redeemed = (Number(c.redeemed)||0)+1; await writeJSON(COUPS, { items:(coups.items||[]).map((x:any)=> x.code===c.code? c : x) }); }
      }
    }

    const now = Date.now();
    const item: Order = {
      id:`ad_${now}`, serial, userId:sessionUser.id, name:sessionUser.name,
      adProductId:b.adProductId, state:"pending", startAt:null, endAt:null,
      priceOMR: base, discount, finalPriceOMR: final, createdAt: now
    };

    const ords = await readJSON(ORDERS);
    ords.items = [item, ...(ords.items||[])];
    await writeJSON(ORDERS, ords);

    const tasks = await readJSON(TASKS);
    tasks.items = [{ id:`task_${now}`, title:`مراجعة طلب إعلان ${serial}`, description:`${item.name} (${item.userId}) — ${item.adProductId}`, status:"open", linked:{ type:"ad", id:item.id } }, ...(tasks.items||[])];
    await writeJSON(TASKS, tasks);

    const notifs = await readJSON(NOTIFS);
    notifs.items = [{ id:`ntf_${now}`, userId:item.userId, title:"تم استلام طلب الإعلان", body:`رقم الطلب: ${serial}`, read:false, createdAt:now }, ...(notifs.items||[])];
    await writeJSON(NOTIFS, notifs);

    return res.status(201).json({ ok:true, item, durationDays: days });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method Not Allowed" });
}
