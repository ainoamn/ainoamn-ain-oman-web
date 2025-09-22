import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs"; import fsp from "fs/promises"; import path from "path";

type BookingStatus = "pending"|"reserved"|"leased"|"cancelled";
type Booking = {
  id: string; bookingNumber: string; propertyId: string;
  propertyTitle?: string; propertyReference?: string;
  startDate: string; endDate?: string; duration: number;
  totalAmount: number; status: BookingStatus; createdAt: string;
  contractSigned?: boolean;
  customerInfo: { name: string; phone: string; email?: string };
  ownerDecision?: { approved?: boolean; reason?: string; decidedAt?: string } | null;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "bookings.json");

async function ensure(){ if(!fs.existsSync(DATA_DIR)) await fsp.mkdir(DATA_DIR,{recursive:true}); if(!fs.existsSync(FILE)) await fsp.writeFile(FILE,"[]","utf8"); }
async function readAll(): Promise<Booking[]>{ await ensure(); try{ return JSON.parse(await fsp.readFile(FILE,"utf8")); } catch{ return []; } }
async function writeAll(items: Booking[]){ await ensure(); await fsp.writeFile(FILE, JSON.stringify(items,null,2), "utf8"); }

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method!=="POST") { res.setHeader("Allow","POST"); return res.status(405).json({error:"Method Not Allowed"}); }
  try{
    const b = req.body || {};
    if(!b.id && !b.bookingNumber) return res.status(400).json({ error:"id or bookingNumber required" });
    if(!b.propertyId) return res.status(400).json({ error:"propertyId required" });
    const items = await readAll();

    const idx = items.findIndex(x => (b.id && x.id===b.id) || (b.bookingNumber && x.bookingNumber===b.bookingNumber));
    const now = new Date().toISOString();

    const next: Booking = {
      id: b.id || (b.bookingNumber || "B-"+Date.now()),
      bookingNumber: b.bookingNumber || b.id,
      propertyId: String(b.propertyId),
      propertyTitle: b.propertyTitle || "",
      propertyReference: b.propertyReference || "",
      startDate: String(b.startDate || now),
      endDate: b.endDate ? String(b.endDate) : undefined,
      duration: Number(b.duration || 12),
      totalAmount: Number(b.totalAmount || 0),
      status: (b.status || "reserved") as BookingStatus,
      createdAt: items[idx]?.createdAt || now,
      contractSigned: !!b.contractSigned,
      customerInfo: {
        name: b?.customerInfo?.name || "",
        phone: b?.customerInfo?.phone || "",
        email: b?.customerInfo?.email || ""
      },
      ownerDecision: items[idx]?.ownerDecision || null,
    };

    if(idx>=0) items[idx] = { ...items[idx], ...next };
    else items.push(next);

    await writeAll(items);
    return res.status(200).json({ item: next, upserted: true });
  }catch(e:any){
    return res.status(500).json({ error: e?.message || "Internal Error" });
  }
}
