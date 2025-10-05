// src/pages/api/contract-settings/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { readJson, writeJson } from "@/lib/fsdb";

type Settings = { templateId: string; defaultFields: Record<string,string>; updatedAt: string };
const FILE = "contract_settings.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method === "GET") {
    const cur = await readJson<Settings>(FILE, { templateId:"", defaultFields:{}, updatedAt: new Date().toISOString() });
    return res.status(200).json({ item: cur });
  }
  if (req.method === "PUT" || req.method === "PATCH") {
    try{
      const b = req.body || {};
      const next: Settings = {
        templateId: String(b.templateId || ""),
        defaultFields: typeof b.defaultFields==="object" && b.defaultFields ? b.defaultFields : {},
        updatedAt: new Date().toISOString()
      };
      await writeJson(FILE, next);
      return res.status(200).json({ item: next });
    }catch(e:any){ return res.status(400).json({ error: e?.message || "Bad Request" }); }
  }
  res.setHeader("Allow","GET,PUT,PATCH"); return res.status(405).json({ error:"Method Not Allowed" });
}
