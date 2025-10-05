// src/pages/api/contract-assignments/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { readJson, writeJson, uid } from "@/lib/fsdb";

type Assignment = {
  id: string; level: "building"|"unit"; refId: string;
  templateId: string; fieldsOverride?: Record<string,string>;
  updatedAt: string;
};

const FILE = "contract_assignments.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method === "GET") {
    const items = await readJson<Assignment[]>(FILE, []);
    const { level, refId } = req.query;
    const filtered = items.filter(a=>{
      if (level && String(a.level)!==String(level)) return false;
      if (refId && String(a.refId)!==String(refId)) return false;
      return true;
    });
    return res.status(200).json({ items: filtered });
  }
  if (req.method === "POST") {
    try{
      const b = req.body || {};
      const items = await readJson<Assignment[]>(FILE, []);
      const item: Assignment = {
        id: uid("CA"),
        level: b.level==="building" ? "building" : "unit",
        refId: String(b.refId || ""),
        templateId: String(b.templateId || ""),
        fieldsOverride: b.fieldsOverride || {},
        updatedAt: new Date().toISOString()
      };
      items.push(item); await writeJson(FILE, items);
      return res.status(201).json({ item });
    }catch(e:any){ return res.status(400).json({ error: e?.message || "Bad Request" }); }
  }
  if (req.method === "PUT" || req.method === "PATCH") {
    try{
      const b = req.body || {};
      const items = await readJson<Assignment[]>(FILE, []);
      const idx = items.findIndex(x=>x.id===b.id);
      if (idx === -1) return res.status(404).json({ error:"Not Found" });
      items[idx] = { ...items[idx], ...b, updatedAt: new Date().toISOString() };
      await writeJson(FILE, items);
      return res.status(200).json({ item: items[idx] });
    }catch(e:any){ return res.status(400).json({ error: e?.message || "Bad Request" }); }
  }
  res.setHeader("Allow","GET,POST,PUT,PATCH"); return res.status(405).json({ error:"Method Not Allowed" });
}
