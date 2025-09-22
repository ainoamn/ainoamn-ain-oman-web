// src/pages/api/bookings/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { readJson, writeJson } from "@/lib/fsdb";
import type { Booking } from "@/lib/types";

const FILE = "bookings.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const idOrNumber = String(req.query.id || "");

  if (req.method === "GET") {
    const items = await readJson<Booking[]>(FILE, []);
    const item = items.find(x=> x.id===idOrNumber || x.bookingNumber===idOrNumber);
    if(!item) return res.status(404).json({ error:"Not Found" });
    return res.status(200).json({ item });
  }

  if (req.method === "PATCH") {
    try{
      const items = await readJson<Booking[]>(FILE, []);
      const idx = items.findIndex(x=> x.id===idOrNumber || x.bookingNumber===idOrNumber);
      if(idx<0) return res.status(404).json({ error:"Not Found" });

      const body = req.body || {};
      const action = String(body.action||"");

      const b = { ...items[idx] };

      if(action==="tenantSign"){
        b.status = "accounting";
      }else if(action==="accountingConfirm"){
        b.status = "management";
      }else if(action==="managementApprove"){
        b.status = "leased";
      }else if(action==="cancel"){
        b.status = "cancelled";
      }

      items[idx] = b;
      await writeJson(FILE, items);
      return res.status(200).json({ item: b });
    }catch(e:any){ return res.status(400).json({ error:e?.message || "Bad Request" }); }
  }

  res.setHeader("Allow","GET,PATCH");
  return res.status(405).json({ error:"Method Not Allowed" });
}
