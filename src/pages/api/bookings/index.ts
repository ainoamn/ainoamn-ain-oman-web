// src/pages/api/bookings/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { readJson, writeJson, uid } from "@/lib/fsdb";
import type { Booking, Building } from "@/lib/types";

const FILE = "bookings.json";

function computeEndFromMonths(start: string, months: number) {
  const s = new Date(start); const e = new Date(s); e.setMonth(e.getMonth()+Number(months||0)); return e.toISOString();
}
function monthsBetween(start: string, end?: string, fallbackMonths?: number){
  if (!end) return Number(fallbackMonths||0);
  const d1 = new Date(start); const d2 = new Date(end);
  const days = (d2.getTime()-d1.getTime())/86400000;
  return Math.max(1, Math.round(days/30));
}
function computeMunicipality(amount: number){ return Math.round((Number(amount||0) * 0.03) * 1000) / 1000; }

async function fetchEffective(host: string, unitId: string, buildingId: string){
  try{
    const base = /^https?:\/\//.test(host) ? host : `http://${host}`;
    const url = new URL("/api/contracts/effective", base);
    url.searchParams.set("propertyId", unitId);
    if (buildingId) url.searchParams.set("buildingId", buildingId);
    const r = await fetch(url.toString());
    return r.ok ? await r.json() : null;
  }catch{ return null; }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method === "GET") {
    // قراءة الحجوزات من ملف bookings.json
    const items = await readJson<Booking[]>(FILE, []);
    
    // قراءة الحجوزات من db.json أيضاً للتوافق
    const fs = require('fs');
    const path = require('path');
    const dbPath = path.resolve(process.cwd(), ".data", "db.json");
    let dbItems: any[] = [];
    
    try {
      if (fs.existsSync(dbPath)) {
        const db = JSON.parse(fs.readFileSync(dbPath, "utf8") || "{}");
        dbItems = Array.isArray(db.bookings) ? db.bookings : [];
      }
    } catch (error) {
      console.warn("Error reading db.json:", error);
    }
    
    // دمج الحجوزات من كلا المصدرين (التأكد من أنها arrays)
    const allItems = [...(Array.isArray(items) ? items : []), ...(Array.isArray(dbItems) ? dbItems : [])];
    
    // إزالة التكرارات بناءً على ID
    const uniqueItems = new Map();
    allItems.forEach(item => {
      const id = String(item.id || "");
      if (id && !uniqueItems.has(id)) {
        // إضافة بيانات افتراضية للحجوزات الناقصة
        const enhancedItem = {
          id: item.id,
          bookingNumber: item.bookingNumber || item.id,
          propertyId: item.propertyId || item.unitId || "غير محدد",
          propertyTitle: item.propertyTitle || "عقار غير محدد",
          propertyReference: item.propertyReference || "غير محدد",
          startDate: item.startDate || item.createdAt || new Date().toISOString(),
          duration: item.duration || item.durationMonths || 1,
          totalAmount: item.totalAmount || item.totalRent || 0,
          status: item.status || "pending",
          createdAt: item.createdAt || new Date().toISOString(),
          contractSigned: item.contractSigned || false,
          customerInfo: item.customerInfo || item.tenant || { name: "غير محدد", phone: "غير محدد", email: "" },
          ownerDecision: item.ownerDecision || null,
          ...item
        };
        uniqueItems.set(id, enhancedItem);
      }
    });
    
    const finalItems = Array.from(uniqueItems.values());
    
    return res.status(200).json({ items: finalItems });
  }

  if (req.method === "POST") {
    try{
      const b = req.body || {};
      const items = await readJson<Booking[]>(FILE, []);
      const now = new Date().toISOString();
      const id = uid("B");

      // المدة
      const durationMonths = monthsBetween(String(b.startDate||now), String(b.endDate||""), Number(b.durationMonths||0));
      const end = b.endDate ? new Date(b.endDate).toISOString() : computeEndFromMonths(String(b.startDate||now), durationMonths);

      // إذا لم تُرسل totalRent نحسبها من إيجار الوحدة الشهري × مدة العقد
      let totalRent = Number(b.totalRent || 0);
      if (!totalRent || totalRent<=0) {
        const buildings = await readJson<Building[]>("buildings.json", []);
        const building = buildings.find(x=>x.id===String(b.buildingId||""));
        const unit = building?.units?.find(u=>u.id===String(b.unitId||""));
        const monthly = Number(unit?.rentAmount || 0);
        totalRent = Math.round(monthly * durationMonths * 1000)/1000;
      }
      const municipalityFee3pct = computeMunicipality(totalRent);

      const eff = await fetchEffective(String(req.headers.host), String(b.unitId||""), String(b.buildingId||""));

      const item: Booking = {
        id,
        bookingNumber: b.bookingNumber || id,
        buildingId: String(b.buildingId || ""),
        unitId: String(b.unitId || ""),
        startDate: String(b.startDate || now),
        durationMonths,
        endDate: end,
        status: "pending",
        createdAt: now,
        totalRent,
        deposit: b.deposit ? Number(b.deposit) : 0,
        depositPaid: !!b.depositPaid,
        depositReceiptNo: b.depositReceiptNo || undefined,
        depositPaymentMethod: b.depositPaymentMethod || undefined,
        paymentMethod: b.paymentMethod || "cash",
        cheque: null,
        cheques: Array.isArray(b.cheques) ? b.cheques.map((c:any)=>({
          chequeNo: String(c.chequeNo||""),
          chequeDate: String(c.chequeDate||now),
          amount: Number(c.amount||0),
          status: c.status || "pending",
          image: c.image || undefined
        })) : [],
        guaranteeCheques: Array.isArray(b.guaranteeCheques) ? b.guaranteeCheques.map((c:any)=>({
          chequeNo: String(c.chequeNo||""),
          chequeDate: String(c.chequeDate||now),
          amount: Number(c.amount||0),
          status: c.status || "pending",
          image: c.image || undefined
        })) : [],
        municipalityFee3pct,
        meters: b.meters || null,
        tenant: b.tenant,
        contractSnapshot: eff ? {
          templateId: String(eff.templateId||""),
          templateName: String(eff.templateName||""),
          bodyAr: String(eff.bodyAr||""),
          bodyEn: String(eff.bodyEn||""),
          fields: eff.fields || {},
          resolvedAt: String(eff.resolvedAt||now)
        } : null
      };

      items.push(item);
      await writeJson(FILE, items);
      return res.status(201).json({ item });
    }catch(e:any){ return res.status(400).json({ error:e?.message || "Bad Request" }); }
  }

  res.setHeader("Allow","GET,POST");
  return res.status(405).json({ error:"Method Not Allowed" });
}
