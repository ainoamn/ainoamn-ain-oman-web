import type { NextApiRequest, NextApiResponse } from "next";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

const DATA = path.join(process.cwd(), ".data");
const FILE = path.join(DATA, "ad-products.json");

type AdProduct = {
  id: string;                  // مثل: featured_real_estate
  name: string;                // "عقار مميز"
  priceOMR: number;            // تكلفة الشراء
  durationDays: number;        // مدة الظهور
  category?: string;           // real_estate | generic | car | ...
  description?: string;
  icon?: string;               // URL أو Emoji
  highlight?: boolean;
};

async function ensure(){ try{await access(DATA)}catch{await mkdir(DATA,{recursive:true})} try{await access(FILE)}catch{await writeFile(FILE,JSON.stringify({items:[]},null,2),"utf8")} }
async function readDB(){ const raw=await readFile(FILE,"utf8").catch(()=> '{"items":[]}'); return JSON.parse(raw||'{"items":[]}');}
async function writeDB(d:any){ await writeFile(FILE, JSON.stringify(d,null,2), "utf8"); }

async function seedIfEmpty(){
  const db = await readDB();
  if ((db.items||[]).length>0) return db;
  const items: AdProduct[] = [
    { id:"featured_real_estate", name:"عقار مميز", priceOMR: 5, durationDays: 7, category:"real_estate", icon:"🏠", description:"تمييز العقار 7 أيام", highlight:true },
    { id:"bump_listing", name:"رفع الإعلان", priceOMR: 1, durationDays: 0, category:"generic", icon:"⬆️", description:"رفع للأعلى مرة واحدة" },
    { id:"homepage_banner", name:"راية الصفحة الرئيسية", priceOMR: 25, durationDays: 7, category:"generic", icon:"🏷️", description:"ظهور في الراية لمدة أسبوع" },
  ];
  await writeDB({ items });
  return { items };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  await ensure();

  if (req.method === "GET") {
    const db = await seedIfEmpty();
    return res.status(200).json(db);
  }

  if (req.method === "POST") {
    const b = req.body as Partial<AdProduct>;
    if (!b.name || !Number.isFinite(b.priceOMR) || !Number.isFinite(b.durationDays)) {
      return res.status(400).json({ error:"name, priceOMR, durationDays required" });
    }
    const db = await readDB();
    const id = b.id?.trim() || b.name!.trim().toLowerCase().replace(/\s+/g,"_");
    const item: AdProduct = {
      id, name: b.name, priceOMR: Number(b.priceOMR), durationDays: Number(b.durationDays),
      category: b.category || "generic", description: b.description || "", icon: b.icon || "", highlight: !!b.highlight
    };
    db.items = [item, ...(db.items||[]).filter((x:any)=> x.id!==id)];
    await writeDB(db);
    return res.status(201).json({ ok:true, item });
  }

  res.setHeader("Allow","GET, POST");
  return res.status(405).json({ error:"Method Not Allowed" });
}
