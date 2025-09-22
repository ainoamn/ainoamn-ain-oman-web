// src/pages/api/contracts/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs"; import fsp from "fs/promises"; import path from "path";

type ContractStatus = "draft" | "sent" | "approved" | "rejected" | "active" | "cancelled";
type Contract = import("./index").Contract;

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "contracts.json");

async function ensure(){ if(!fs.existsSync(DATA_DIR)) await fsp.mkdir(DATA_DIR,{recursive:true}); if(!fs.existsSync(FILE)) await fsp.writeFile(FILE,"[]","utf8"); }
async function readAll(): Promise<Contract[]>{ await ensure(); try{ return JSON.parse(await fsp.readFile(FILE,"utf8")); } catch{ return []; } }
async function writeAll(items: Contract[]){ await ensure(); await fsp.writeFile(FILE, JSON.stringify(items,null,2),"utf8"); }
function computeEnd(start?: string, months?: number){ if(!start || !months) return undefined; const s=new Date(start); const e=new Date(s); e.setMonth(e.getMonth()+Number(months)); return e.toISOString(); }

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const id = String(req.query.id||"");
  if(!id) return res.status(400).json({ error:"Missing id" });

  const items = await readAll();
  const idx = items.findIndex(c => c.id === id || c.contractNumber === id);
  if (idx === -1 && req.method === "GET") return res.status(404).json({ error:"Not Found" });

  if (req.method === "GET") {
    return res.status(200).json({ item: items[idx] });
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    try{
      const b = req.body || {};
      let next: Contract;
      if (idx === -1) {
        // upsert بسيط لو أُرسلت بيانات كافية
        const now = new Date().toISOString();
        next = {
          id,
          contractNumber: b.contractNumber || id,
          scope: (b.scope === "unified" ? "unified" : "per-unit"),
          propertyId: b.propertyId || undefined,
          templateId: String(b.templateId || ""),
          fields: b.fields || {},
          parties: b.parties || { owner:{name:""}, tenant:{name:""} },
          language: "ar-en",
          startDate: b.startDate || null,
          durationMonths: b.durationMonths ? Number(b.durationMonths) : undefined,
          endDate: computeEnd(b.startDate, b.durationMonths),
          totals: b.totals ? { amount: Number(b.totals.amount||0), currency: b.totals.currency || "OMR" } : undefined,
          status: (b.status || "draft") as ContractStatus,
          createdAt: now,
          updatedAt: now,
          approval: null,
        };
        items.push(next);
      } else {
        next = { ...items[idx], ...b };
        // أفعال workflow
        const action = String(b.action || "");
        if (action === "send") {
          next.status = "sent";
        } else if (action === "tenantApprove") {
          next.approval = { ...(next.approval||{}), byTenant: true, decidedAt: new Date().toISOString(), reason: null };
          if (next.approval?.byOwner) next.status = "active"; else next.status = "approved"; // موافق من المستأجر فقط
        } else if (action === "tenantReject") {
          next.approval = { ...(next.approval||{}), byTenant: false, decidedAt: new Date().toISOString(), reason: String(b.reason||"") };
          next.status = "rejected";
        } else if (action === "ownerApprove") {
          next.approval = { ...(next.approval||{}), byOwner: true, decidedAt: new Date().toISOString(), reason: null };
          if (next.approval?.byTenant) next.status = "active"; else next.status = "approved";
        } else if (action === "ownerReject") {
          next.approval = { ...(next.approval||{}), byOwner: false, decidedAt: new Date().toISOString(), reason: String(b.reason||"") };
          next.status = "rejected";
        }

        if (next.startDate && next.durationMonths && !b.endDate) {
          next.endDate = computeEnd(next.startDate, next.durationMonths);
        }
        next.updatedAt = new Date().toISOString();
        items[idx] = next;
      }

      await writeAll(items);
      return res.status(200).json({ item: next });
    }catch(e:any){
      return res.status(400).json({ error: e?.message || "Bad Request" });
    }
  }

  res.setHeader("Allow","GET,PUT,PATCH"); return res.status(405).json({ error:"Method Not Allowed" });
}
