// src/pages/api/i18n/overrides.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs"; import path from "path";

const dir = path.join(process.cwd(), ".data/i18n-overrides");
function fileFor(lang:string){ if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true}); return path.join(dir, `${lang}.json`); }
function read(lang:string){ try { return JSON.parse(fs.readFileSync(fileFor(lang),"utf8")); } catch { return {}; } }
function write(lang:string, entries: any){ fs.writeFileSync(fileFor(lang), JSON.stringify(entries,null,2), "utf8"); }

export default function handler(req:NextApiRequest,res:NextApiResponse){
  const lang = String(req.query.lang || req.body?.lang || "ar");
  if (req.method === "GET")  return res.status(200).json({ lang, entries: read(lang) });
  if (req.method === "PUT") {
    const cur = read(lang); const add = req.body?.entries || {};
    write(lang, { ...cur, ...add }); return res.status(200).json({ ok:true });
  }
  if (req.method === "DELETE") {
    const cur = read(lang); const keys: string[] = req.body?.keys || [];
    for (const k of keys) delete cur[k];
    write(lang, cur); return res.status(200).json({ ok:true });
  }
  return res.status(405).json({ error:"Method not allowed" });
}
