import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs"; import fsp from "fs/promises"; import path from "path";

type ContractStatus = "draft" | "sent" | "approved" | "rejected" | "active" | "cancelled";
export type Contract = {
  id: string;
  contractNumber: string;
  scope: "unified" | "per-unit";
  propertyId?: string;                  // للوحدات عند النطاق per-unit
  templateId: string;
  fields: Record<string, string>;       // مدخلات المؤجر
  parties: {
    owner: { name: string; phone?: string; email?: string };
    tenant: { name: string; phone?: string; email?: string; userId?: string };
  };
  language: "ar-en";                    // ثابت: عربي + إنجليزي
  startDate?: string;
  durationMonths?: number;
  endDate?: string;
  totals?: { amount: number; currency?: string };
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
  approval: { byTenant?: boolean; byOwner?: boolean; decidedAt?: string; reason?: string | null } | null;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "contracts.json");

async function ensure(){ if(!fs.existsSync(DATA_DIR)) await fsp.mkdir(DATA_DIR,{recursive:true}); if(!fs.existsSync(FILE)) await fsp.writeFile(FILE,"[]","utf8"); }
async function readAll(): Promise<Contract[]>{ 
  await ensure(); 
  try{ 
    const data = await fsp.readFile(FILE,"utf8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch{ 
    return []; 
  } 
}
async function writeAll(items: Contract[]){ await ensure(); await fsp.writeFile(FILE, JSON.stringify(items,null,2), "utf8"); }
function uid(p="C"){ return p+"-"+new Date().toISOString().replace(/[-:.TZ]/g,"").slice(0,14); }
function num(){ return "CN-"+Date.now(); }
function computeEnd(start?: string, months?: number){ if(!start || !months) return undefined; const s=new Date(start); const e=new Date(s); e.setMonth(e.getMonth()+Number(months)); return e.toISOString(); }

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method === "GET") {
    const { propertyId, scope, status, tenantId } = req.query;
    const items = await readAll();
    const filtered = items.filter(c => {
      if (propertyId && String(c.propertyId||"") !== String(propertyId)) return false;
      if (scope && String(c.scope) !== String(scope)) return false;
      if (status && String(c.status) !== String(status)) return false;
      if (tenantId && String(c.parties?.tenant?.userId||"") !== String(tenantId)) return false;
      return true;
    });
    return res.status(200).json({ items: filtered });
  }

  if (req.method === "POST") {
    try{
      const b = req.body || {};
      const items = await readAll();
      const id = uid();
      const now = new Date().toISOString();
      const endDate = computeEnd(b.startDate, b.durationMonths);

      const item: Contract = {
        id,
        contractNumber: b.contractNumber || num(),
        scope: (b.scope === "unified" ? "unified" : "per-unit"),
        propertyId: b.scope === "per-unit" ? String(b.propertyId || "") : undefined,
        templateId: String(b.templateId || ""),
        fields: b.fields || {},
        parties: {
          owner: b.parties?.owner || { name: "" },
          tenant: b.parties?.tenant || { name: "" },
        },
        language: "ar-en",
        startDate: b.startDate || null,
        durationMonths: b.durationMonths ? Number(b.durationMonths) : undefined,
        endDate,
        totals: b.totals ? { amount: Number(b.totals.amount||0), currency: b.totals.currency || "OMR" } : undefined,
        status: (b.status || "draft") as ContractStatus,
        createdAt: now,
        updatedAt: now,
        approval: null,
      };
      items.push(item);
      await writeAll(items);
      return res.status(201).json({ item });
    }catch(e:any){
      return res.status(400).json({ error: e?.message || "Bad Request" });
    }
  }

  res.setHeader("Allow","GET,POST"); return res.status(405).json({ error:"Method Not Allowed" });
}
