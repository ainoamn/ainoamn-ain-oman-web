// root: src/pages/api/bookings/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getById as getPropertyById, upsert as upsertProperty } from "@/server/properties/store";

type BookingStatus = "pending" | "reserved" | "leased" | "cancelled";
type Booking = {
  id: string; bookingNumber: string; propertyId: string;
  startDate: string; duration: number; totalAmount: number;
  status: BookingStatus; createdAt: string;
  contractSigned?: boolean;
  customerInfo: { name: string; phone: string; email?: string };
};

type Store = { bookings: Booking[]; };
declare global { var __AIN_OMAN_STORE__: Store | undefined; }
function store(): Store {
  if (!global.__AIN_OMAN_STORE__) global.__AIN_OMAN_STORE__ = { bookings: [] };
  return global.__AIN_OMAN_STORE__;
}
function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = String(req.query.id || "");
  if (!id) return res.status(400).json({ error: "Missing id" });

  const idx = store().bookings.findIndex(b => b.id === id);
  const cur = idx >= 0 ? store().bookings[idx] : null;
  if (!cur && req.method !== "POST") {
    return res.status(404).json({ error: "Not Found" });
  }

  if (req.method === "GET") {
    return res.status(200).json({ item: cur });
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    try {
      const body = req.body || {};
      const prop = getPropertyById(String(cur!.propertyId));
      let next: Booking = { ...cur! };

      const action = String(body.action || "");
      if (action === "confirm") {
        next.status = "reserved";
        if (prop) upsertProperty({ ...prop, status: "reserved", updatedAt: new Date().toISOString() });
      } else if (action === "lease") {
        next.status = "leased";
        if (prop) upsertProperty({ ...prop, status: "leased", updatedAt: new Date().toISOString() });
      } else if (action === "cancel") {
        next.status = "cancelled";
        if (prop) upsertProperty({ ...prop, status: "vacant", updatedAt: new Date().toISOString() });
      } else {
        // تحديث عادي للحقول
        next = { ...next, ...body };
      }

      store().bookings[idx] = next;
      return res.status(200).json({ item: next });
    } catch (e:any) {
      return res.status(400).json({ error: e?.message || "Bad Request" });
    }
  }

  res.setHeader("Allow","GET,PUT,PATCH");
  return res.status(405).json({ error: "Method Not Allowed" });
}
