// src/pages/api/contract-templates/_seeded.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs"; import fsp from "fs/promises"; import path from "path";

export type ContractTemplate = {
  id: string;
  name: string;
  scope: "unified"|"per-unit";
  bodyAr: string;
  bodyEn: string;
  fields: { key: string; labelAr: string; labelEn: string; required?: boolean }[];
  createdAt: string; updatedAt: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "contract_templates.json");

async function ensure(){ if(!fs.existsSync(DATA_DIR)) await fsp.mkdir(DATA_DIR,{recursive:true}); if(!fs.existsSync(FILE)) await fsp.writeFile(FILE,"[]","utf8"); }
async function readAll(): Promise<ContractTemplate[]>{ await ensure(); try{ return JSON.parse(await fsp.readFile(FILE,"utf8")); } catch { return []; } }
async function writeAll(items: ContractTemplate[]){ await ensure(); await fsp.writeFile(FILE, JSON.stringify(items,null,2),"utf8"); }
function uid(){ return "T-"+new Date().toISOString().replace(/[-:.TZ]/g,"").slice(0,14); }

function seed(): ContractTemplate[] {
  const now = new Date().toISOString();
  const fields = [
    { key:"landlordName", labelAr:"اسم المؤجر", labelEn:"Landlord Name", required:true },
    { key:"tenantName", labelAr:"اسم المستأجر", labelEn:"Tenant Name", required:true },
    { key:"unitRef", labelAr:"مرجع الوحدة", labelEn:"Unit Ref", required:true },
    { key:"rentAmount", labelAr:"قيمة الإيجار", labelEn:"Rent Amount", required:true },
    { key:"rentCurrency", labelAr:"العملة", labelEn:"Currency", required:true },
    { key:"startDate", labelAr:"تاريخ البداية", labelEn:"Start Date", required:true },
    { key:"durationMonths", labelAr:"المدة بالأشهر", labelEn:"Duration (months)", required:true },
    { key:"paymentSchedule", labelAr:"جدول السداد", labelEn:"Payment Schedule" },
    { key:"depositAmount", labelAr:"التأمين", labelEn:"Security Deposit" },
    { key:"utilities", labelAr:"الخدمات", labelEn:"Utilities" },
    { key:"rules", labelAr:"الالتزامات", labelEn:"Rules" },
  ];

  const ar1 = `عقد إيجار موحّد
المؤجر: {{landlordName}}
المستأجر: {{tenantName}}
الوحدة: {{unitRef}}
الإيجار: {{rentAmount}} {{rentCurrency}}
البداية: {{startDate}} لمدة {{durationMonths}} شهرًا
جدول السداد: {{paymentSchedule}}
التأمين: {{depositAmount}}
الخدمات: {{utilities}}
الالتزامات: {{rules}}`;

  const en1 = `Unified Lease Contract
Landlord: {{landlordName}}
Tenant: {{tenantName}}
Unit: {{unitRef}}
Rent: {{rentAmount}} {{rentCurrency}}
Start: {{startDate}} for {{durationMonths}} month(s)
Payment Schedule: {{paymentSchedule}}
Security Deposit: {{depositAmount}}
Utilities: {{utilities}}
Rules: {{rules}}`;

  const t1: ContractTemplate = { id: uid(), name:"عقد موحّد / Unified Lease", scope:"unified", bodyAr: ar1, bodyEn: en1, fields, createdAt: now, updatedAt: now };
  const t2: ContractTemplate = { id: uid(), name:"عقد وحدة / Per-Unit Lease", scope:"per-unit", bodyAr: ar1, bodyEn: en1, fields, createdAt: now, updatedAt: now };
  return [t1, t2];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method === "GET") {
    let items = await readAll();
    if (!items.length) { items = seed(); await writeAll(items); }
    return res.status(200).json({ items });
  }
  if (req.method === "POST") {
    try{
      const b = req.body || {};
      const items = await readAll();
      const now = new Date().toISOString();
      const item: ContractTemplate = {
        id: uid(),
        name: String(b.name || "Template"),
        scope: b.scope==="unified" ? "unified" : "per-unit",
        bodyAr: String(b.bodyAr || ""),
        bodyEn: String(b.bodyEn || ""),
        fields: Array.isArray(b.fields)? b.fields : [],
        createdAt: now, updatedAt: now
      };
      items.push(item); await writeAll(items);
      return res.status(201).json({ item });
    }catch(e:any){ return res.status(400).json({ error:e?.message || "Bad Request" }); }
  }
  res.setHeader("Allow","GET,POST"); return res.status(405).json({ error:"Method Not Allowed" });
}
