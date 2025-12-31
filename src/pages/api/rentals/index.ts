// src/pages/api/rentals/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { repo } from "@/server/rentals/workflow";
import type { Rental } from "@/server/rentals/repo";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // الحصول على userId من مصادر متعددة
  const getUserId = (): string => {
    // من query parameter
    if (req.query.userId && typeof req.query.userId === 'string') {
      return req.query.userId;
    }
    // من header
    if (req.headers["x-user-id"] && typeof req.headers["x-user-id"] === 'string') {
      return req.headers["x-user-id"];
    }
    // من cookies
    const cookies = req.headers.cookie || '';
    const uidMatch = cookies.match(/(?:^|;\s*)uid=([^;]+)/);
    if (uidMatch && uidMatch[1]) {
      return decodeURIComponent(uidMatch[1]);
    }
    // افتراضي للاختبار
    return "demo-user";
  };
  
  const userId = getUserId();
  
  if (req.method === "GET") {
    try {
      let items: any[] = [];
      
      if ("mine" in req.query) {
        items = await repo.listMine(userId);
        console.log(`📋 جلب عقود المستخدم ${userId}:`, items.length, 'عقد');
      } else if (req.query.propertyId) {
        items = await repo.listByProperty(String(req.query.propertyId));
        console.log(`📋 جلب عقود العقار ${req.query.propertyId}:`, items.length, 'عقد');
      } else {
        items = await repo.listAll();
        console.log(`📋 جلب جميع العقود:`, items.length, 'عقد');
      }
      
      // إزالة التكرارات بناءً على id (احترازي)
      const uniqueItems = items.reduce((acc: any[], rental: any) => {
        const exists = acc.find(r => r.id === rental.id);
        if (!exists) {
          acc.push(rental);
        }
        return acc;
      }, []);
      
      if (items.length !== uniqueItems.length) {
        console.log(`⚠️ تمت إزالة ${items.length - uniqueItems.length} عقد مكرر في API`);
      }
      
      // Log أول عقد كمثال
      if (uniqueItems.length > 0) {
        console.log('📦 مثال على بيانات العقد:', {
          id: uniqueItems[0].id,
          propertyId: uniqueItems[0].propertyId,
          tenantName: uniqueItems[0].tenantName,
          startDate: uniqueItems[0].startDate,
          endDate: uniqueItems[0].endDate,
          monthlyRent: uniqueItems[0].monthlyRent
        });
      }
      
      return res.json({ items: uniqueItems });
    } catch (error) {
      console.error('❌ خطأ في جلب العقود:', error);
      return res.status(500).json({ error: 'Internal server error', items: [] });
    }
  }
  if (req.method === "POST") {
    const b = req.body as any;
    if (!b?.id || !b?.propertyId || !b?.tenantId) return res.status(400).json({ error: "missing_fields" });
    
    // حفظ جميع البيانات المرسلة
    const r: any = {
      id: b.id,
      propertyId: b.propertyId,
      tenantId: b.tenantId,
      tenantName: b.tenantName,
      tenantPhone: b.tenantPhone,
      tenantEmail: b.tenantEmail,
      unitId: b.unitId,
      startDate: b.startDate,
      endDate: b.endDate,
      duration: b.duration,
      monthlyRent: b.monthlyRent,
      deposit: b.deposit,
      amount: b.amount || b.monthlyRent || 0,
      currency: b.currency || "OMR",
      contractType: b.contractType,
      terms: b.terms,
      customTerms: b.customTerms,
      status: b.status,
      state: "reserved",
      docs: [],
      history: [{ at: Date.now(), by: userId, event: "reserve", to: "reserved" }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      // بيانات إضافية
      ...b
    };
    
    // تحديث حالة العقار في db.json
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const dbPath = path.resolve(process.cwd(), '.data', 'db.json');
      const dbContent = await fs.readFile(dbPath, 'utf8');
      const db = JSON.parse(dbContent);
      
      if (db.properties && Array.isArray(db.properties)) {
        const propertyIndex = db.properties.findIndex((p: any) => p.id === b.propertyId);
        if (propertyIndex !== -1) {
          db.properties[propertyIndex].status = 'reserved';
          db.properties[propertyIndex].updatedAt = new Date().toISOString();
          await fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8');
          console.log(`✅ تم تحديث حالة العقار ${b.propertyId} إلى "محجوز"`);
        }
      }
    } catch (error) {
      console.error('⚠️ خطأ في تحديث حالة العقار:', error);
      // لا نوقف العملية إذا فشل تحديث العقار
    }
    
    return res.json({ ok: true, rental: await repo.save(r) });
  }
  res.status(405).end();
}
