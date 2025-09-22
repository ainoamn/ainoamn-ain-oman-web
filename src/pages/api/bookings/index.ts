// root: src/pages/api/bookings/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getById as getPropertyById, upsert as upsertProperty } from "@/server/properties/store";

type BookingStatus = "pending" | "reserved" | "leased" | "cancelled";
type Booking = {
  id: string;
  bookingNumber: string;
  propertyId: string;
  propertyTitle?: string;
  propertyReference?: string;
  startDate: string;
  endDate?: string;
  duration: number;
  totalAmount: number;
  status: BookingStatus;
  createdAt: string;
  contractSigned?: boolean;
  customerInfo: { name: string; phone: string; email?: string };
};

type Store = { bookings: Booking[]; };
declare global { // eslint-disable-next-line no-var
  var __AIN_OMAN_STORE__: Store | undefined;
}
function store(): Store {
  if (!global.__AIN_OMAN_STORE__) global.__AIN_OMAN_STORE__ = { bookings: [] };
  return global.__AIN_OMAN_STORE__;
}
function uid(prefix: string){ return prefix + "-" + new Date().toISOString().replace(/[-:.TZ]/g,"").slice(0,14); }
function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { propertyId, role } = req.query;
    const items = store().bookings.filter(b => {
      if (propertyId) return String(b.propertyId) === String(propertyId);
      if (role === "owner") return true; // تبسيط: عرض كل الحجوزات للمالك
      return true;
    });
    return res.status(200).json({ items });
  }

  if (req.method === "POST") {
    try {
      const b = req.body || {};
      const id = uid("B");
      const now = new Date().toISOString();
      const prop = b.propertyId ? getPropertyById(String(b.propertyId)) : null;
      const item: Booking = {
        id,
        bookingNumber: b.bookingNumber || id,
        propertyId: String(b.propertyId),
        propertyTitle: b.propertyTitle || (prop?.title?.ar || prop?.title?.en || ""),
        propertyReference: b.propertyReference || prop?.referenceNo || "",
        startDate: String(b.startDate || now),
        duration: Number(b.duration || 12),
        totalAmount: Number(b.totalAmount || 0),
        status: (b.status || "pending") as BookingStatus,
        createdAt: now,
        contractSigned: !!b.contractSigned,
        customerInfo: {
          name: b?.customerInfo?.name || "",
          phone: b?.customerInfo?.phone || "",
          email: b?.customerInfo?.email || ""
        }
      };
      store().bookings.push(item);

      // عند إنشاء حجز "reserved" نحدّث حالة العقار
      if (item.status === "reserved" && prop) {
        upsertProperty({ ...prop, status: "reserved", updatedAt: now });
      }

      return res.status(201).json({ item });
    } catch (e:any) {
      return res.status(400).json({ error: e?.message || "Bad Request" });
    }
  }

  res.setHeader("Allow","GET,POST");
  return res.status(405).json({ error: "Method Not Allowed" });
}
