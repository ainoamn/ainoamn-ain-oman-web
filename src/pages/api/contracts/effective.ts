// src/pages/api/contracts/effective.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { readJson } from "@/lib/fsdb";

type Settings = { templateId:string; defaultFields:Record<string,string>; updatedAt:string };
type Template = { id:string; name:string; scope:"unified"|"per-unit"; bodyAr:string; bodyEn:string; fields:any[] };
type Assignment = { id:string; level:"building"|"unit"; refId:string; templateId:string; fieldsOverride?:Record<string,string> };

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== "GET") { res.setHeader("Allow", "GET"); return res.status(405).json({ error:"Method Not Allowed" }); }
  const propertyId = String(req.query.propertyId || "");
  const buildingId = String(req.query.buildingId || "");
  if (!propertyId && !buildingId) return res.status(400).json({ error:"propertyId or buildingId required" });

  const settings = await readJson<Settings>("contract_settings.json", { templateId:"", defaultFields:{}, updatedAt:"" });
  const templates = await readJson<Template[]>("contract_templates.json", []);
  const assigns = await readJson<Assignment[]>("contract_assignments.json", []);

  let chosen = assigns.find(a=>a.level==="unit" && a.refId===propertyId);
  if (!chosen && buildingId) chosen = assigns.find(a=>a.level==="building" && a.refId===buildingId);
  const templateId = chosen?.templateId || settings.templateId;
  const template = templates.find(t=>t.id===templateId);
  if (!template) return res.status(404).json({ error:"No template configured" });

  const fields = { ...(settings.defaultFields||{}), ...(chosen?.fieldsOverride||{}) };
  return res.status(200).json({
    templateId: template.id,
    templateName: template.name,
    scope: chosen ? chosen.level : "unified",
    propertyId: propertyId || null,
    buildingId: buildingId || null,
    fields,
    bodyAr: template.bodyAr,
    bodyEn: template.bodyEn,
    resolvedAt: new Date().toISOString()
  });
}
