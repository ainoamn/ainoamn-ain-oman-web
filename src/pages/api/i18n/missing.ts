// src/pages/api/i18n/missing.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs"; import path from "path";

const file = path.join(process.cwd(), ".data/missing-i18n.json");
function read(){ try { return JSON.parse(fs.readFileSync(file,"utf8")); } catch { return {}; } }
function write(v:any){ const dir=path.dirname(file); if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true}); fs.writeFileSync(file, JSON.stringify(v,null,2), "utf8"); }
function handler(req:NextApiRequest,res:NextApiResponse){
  if (req.method === "GET") return res.status(200).json(read());
  if (req.method === "POST") {
    const body = req.body || {}; const items: string[] = Array.isArray(body.items)? body.items: [];
    const db = read();
    for (const tag of items) { const [lang,key] = String(tag).split(":"); if(!lang||!key) continue; db[lang] ||= {}; db[lang][key] = (db[lang][key]||0)+1; }
    write(db); return res.status(200).json({ ok:true });
  }
  if (req.method === "DELETE") { write({}); return res.status(200).json({ ok:true }); }
  return res.status(405).json({ error:"Method not allowed" });
}
