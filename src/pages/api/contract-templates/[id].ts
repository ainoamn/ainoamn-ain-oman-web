// @ts-nocheck
// src/pages/api/contract-templates/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs"; import fsp from "fs/promises"; import path from "path";
type ContractTemplate = import("./index").ContractTemplate;

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "contract_templates.json");

async function ensure(){ if(!fs.existsSync(DATA_DIR)) await fsp.mkdir(DATA_DIR,{recursive:true}); if(!fs.existsSync(FILE)) await fsp.writeFile(FILE,"[]","utf8"); }
async function readAll(): Promise<ContractTemplate[]>{ await ensure(); try{ return JSON.parse(await fsp.readFile(FILE,"utf8")); } catch{ return []; } }
async function writeAll(items: ContractTemplate[]){ await ensure(); await fsp.writeFile(FILE, JSON.stringify(items,null,2), "utf8"); }

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const id = String(req.query.id||"");
  const items = await readAll();
  const idx = items.findIndex(t => t.id===id);
  if (req.method === "GET") {
    if (idx === -1) return res.status(404).json({ error:"Not Found" });
    return res.status(200).json({ item: items[idx] });
  }
  if (req.method === "PUT" || req.method === "PATCH") {
    try{
      if (idx === -1) return res.status(404).json({ error:"Not Found" });
      const b = req.body || {};
      const next = { ...items[idx], ...b, updatedAt: new Date().toISOString() };
      items[idx] = next; await writeAll(items);
      return res.status(200).json({ item: next });
    }catch(e:any){ return res.status(400).json({ error: e?.message || "Bad Request" }); }
  }
  res.setHeader("Allow","GET,PUT,PATCH"); return res.status(405).json({ error:"Method Not Allowed" });
}
