// src/pages/api/bookings/test-data.ts - إنشاء بيانات تجريبية للحجوزات
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = readDb();
    
    // إنشاء حجز تجريبي
    const testBooking = {
      id: "TEST-BOOKING-001",
      bookingNumber: "BK-001",
      propertyId: "P-20250930145909",
      propertyTitle: "عقار تجريبي",
      propertyReference: "AO-P-000014",
      startDate: new Date().toISOString(),
      duration: 12,
      totalAmount: 12000,
      status: "pending",
      createdAt: new Date().toISOString(),
      contractSigned: false,
      customerInfo: {
        name: "أحمد محمد",
        phone: "+968 9000 0000",
        email: "ahmed@example.com"
      },
      ownerDecision: null
    };

    // إضافة الحجز التجريبي
    if (!Array.isArray(db.bookings)) {
      db.bookings = [];
    }
    
    // إزالة الحجز التجريبي إذا كان موجوداً
    db.bookings = db.bookings.filter((b: any) => b.id !== "TEST-BOOKING-001");
    
    // إضافة الحجز التجريبي
    db.bookings.push(testBooking);
    
    writeDb(db);
    
    return res.status(200).json({
      success: true,
      message: "تم إنشاء حجز تجريبي بنجاح",
      booking: testBooking
    });
    
  } catch (error: any) {
    return res.status(500).json({
      error: "Internal server error",
      message: error.message
    });
  }
}





