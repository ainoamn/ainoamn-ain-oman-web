import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

// تخزين ملفّي بسيط
const DB_PATH = path.resolve(process.cwd(), ".data", "db.json");
function readDb(): any {
  try {
    if (!fs.existsSync(path.dirname(DB_PATH))) fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2), "utf8");
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8") || "{}");
  } catch { return {}; }
}
function writeDb(db: any) {
  if (!fs.existsSync(path.dirname(DB_PATH))) fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db ?? {}, null, 2), "utf8");
}

function findIn(arr: any[] | undefined, id: string) {
  if (!Array.isArray(arr)) return { idx: -1, item: null };
  const idx = arr.findIndex((x) => String(x?.id ?? x?.bookingId) === id);
  return { idx, item: idx >= 0 ? arr[idx] : null };
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = String(req.query.id || "");
  if (!id) return res.status(400).json({ error: "id required" });

  const db = readDb();
  db.bookings ||= [];         // الحجوزات الحديثة
  db.reservations ||= [];     // توافق مع اسم قديم
  db.requests ||= [];         // قد تُحفظ الحجوزات كطلبات type=booking

  // ابحث عن الحجز في أي من المجموعات الثلاثة
  const where =
    ((): { coll: "bookings" | "reservations" | "requests"; idx: number; item: any } => {
      let f = findIn(db.bookings, id);
      if (f.idx >= 0) return { coll: "bookings", idx: f.idx, item: f.item };
      f = findIn(db.reservations, id);
      if (f.idx >= 0) return { coll: "reservations", idx: f.idx, item: f.item };
      // الطلبات من نوع booking فقط
      const idx = Array.isArray(db.requests)
        ? db.requests.findIndex((x: any) => String(x?.id) === id || (x?.type === "booking" && String(x?.bookingId) === id))
        : -1;
      return { coll: "requests", idx, item: idx >= 0 ? db.requests[idx] : null };
    })();

  // إذا لم نجد الحجز في db.json، ابحث في ملف bookings.json
  if (!where.item) {
    try {
      const fs = require('fs');
      const path = require('path');
      const bookingsPath = path.resolve(process.cwd(), ".data", "bookings.json");
      
      if (fs.existsSync(bookingsPath)) {
        const bookingsData = JSON.parse(fs.readFileSync(bookingsPath, "utf8") || "[]");
        const booking = Array.isArray(bookingsData) 
          ? bookingsData.find((b: any) => String(b?.id) === id)
          : null;
        
        if (booking) {
          // تحسين البيانات المرجعة
          const enhancedBooking = {
            id: booking.id,
            bookingNumber: booking.bookingNumber || booking.id,
            propertyId: booking.propertyId || booking.unitId || booking.buildingId || "غير محدد",
            propertyTitle: booking.propertyTitle || "عقار غير محدد",
            propertyReference: booking.propertyReference || "غير محدد",
            startDate: booking.startDate || booking.createdAt || new Date().toISOString(),
            duration: booking.duration || booking.durationMonths || 1,
            totalAmount: booking.totalAmount || booking.totalRent || 0,
            status: booking.status || "pending",
            createdAt: booking.createdAt || new Date().toISOString(),
            contractSigned: booking.contractSigned || false,
            customerInfo: booking.customerInfo || booking.tenant || { name: "غير محدد", phone: "غير محدد", email: "" },
            ownerDecision: booking.ownerDecision || null,
            // إضافة حقول إضافية
            buildingId: booking.buildingId,
            unitId: booking.unitId,
            endDate: booking.endDate,
            deposit: booking.deposit,
            depositPaid: booking.depositPaid,
            paymentMethod: booking.paymentMethod,
            cheque: booking.cheque,
            cheques: booking.cheques,
            municipalityFee3pct: booking.municipalityFee3pct,
            meters: booking.meters,
            contractSnapshot: booking.contractSnapshot,
            ...booking
          };
          
          return res.status(200).json({ item: enhancedBooking });
        }
      }
    } catch (error) {
      console.warn("Error reading bookings.json:", error);
    }
  }

  if (req.method === "GET") {
    if (!where.item) return res.status(404).json({ error: "Not found" });
    
    // تحسين البيانات المرجعة
    const enhancedItem = {
      id: where.item.id,
      bookingNumber: where.item.bookingNumber || where.item.id,
      propertyId: where.item.propertyId || where.item.unitId || "غير محدد",
      propertyTitle: where.item.propertyTitle || "عقار غير محدد",
      propertyReference: where.item.propertyReference || "غير محدد",
      startDate: where.item.startDate || where.item.createdAt || new Date().toISOString(),
      duration: where.item.duration || where.item.durationMonths || 1,
      totalAmount: where.item.totalAmount || where.item.totalRent || 0,
      status: where.item.status || "pending",
      createdAt: where.item.createdAt || new Date().toISOString(),
      contractSigned: where.item.contractSigned || false,
      customerInfo: where.item.customerInfo || where.item.tenant || { name: "غير محدد", phone: "غير محدد", email: "" },
      ownerDecision: where.item.ownerDecision || null,
      ...where.item
    };
    
    return res.status(200).json({ item: enhancedItem });
  }

  if (req.method === "PATCH" || req.method === "PUT") {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    if (!where.item) return res.status(404).json({ error: "Not found" });
    const now = new Date().toISOString();

    // حدّث الحقول الشائعة فقط لضمان التوافق
    const merged = {
      ...where.item,
      status: body.status ?? where.item.status ?? where.item.state,
      totalAmount: body.totalAmount ?? where.item.totalAmount ?? where.item.total ?? where.item.amount,
      updatedAt: now,
    };

    if (where.coll === "bookings") db.bookings[where.idx] = merged;
    else if (where.coll === "reservations") db.reservations[where.idx] = merged;
    else if (where.coll === "requests") db.requests[where.idx] = merged;

    writeDb(db);
    return res.status(200).json({ item: merged });
  }

  if (req.method === "DELETE") {
    if (!where.item) return res.status(404).json({ error: "Not found" });
    if (where.coll === "bookings") db.bookings.splice(where.idx, 1);
    else if (where.coll === "reservations") db.reservations.splice(where.idx, 1);
    else if (where.coll === "requests") db.requests.splice(where.idx, 1);
    writeDb(db);
    return res.status(204).end();
  }

  res.setHeader("Allow", "GET,PATCH,PUT,DELETE");
  return res.status(405).end();
}
