// root: src/pages/api/viewings/index.ts
import type { NextApiRequest, NextApiResponse } from "next";

type ViewingStatus = "new"|"approved"|"declined"|"suggested";
type Viewing = {
  id:string; propertyId:string; customerId?:string;
  preferredDate?:string; preferredTime?:string;
  status:ViewingStatus; suggestedWhen?:string; createdAt:string;
};

type Store = { viewings: Viewing[]; };
declare global { var __AIN_OMAN_VIEWINGS__: Store | undefined; }
function store(): Store {
  if (!global.__AIN_OMAN_VIEWINGS__) global.__AIN_OMAN_VIEWINGS__ = { viewings: [] };
  return global.__AIN_OMAN_VIEWINGS__;
}
function uid(prefix: string){ return prefix + "-" + new Date().toISOString().replace(/[-:.TZ]/g,"").slice(0,14); }

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { propertyId, role } = req.query;
    const items = store().viewings.filter(v => {
      if (propertyId) return String(v.propertyId) === String(propertyId);
      if (role === "owner") return true;
      return true;
    });
    return res.status(200).json({ items });
  }

  if (req.method === "POST") {
    const b = req.body || {};
    const item: Viewing = {
      id: uid("V"),
      propertyId: String(b.propertyId),
      preferredDate: b.preferredDate || "",
      preferredTime: b.preferredTime || "",
      status: (b.status || "new") as ViewingStatus,
      createdAt: new Date().toISOString(),
    };
    store().viewings.push(item);
    return res.status(201).json({ item });
  }

  res.setHeader("Allow","GET,POST");
  return res.status(405).json({ error: "Method Not Allowed" });
}
