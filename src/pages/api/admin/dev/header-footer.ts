// src/pages/api/admin/dev/header-footer.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs"; import path from "path";
type HF = { logoUrl?: string; showTopBar?: boolean; showFooter?: boolean; footerHtml?: string };
const dir = path.join(process.cwd(), ".data");
const file = path.join(dir, "header-footer.json");
function readOne(): HF { try { return JSON.parse(fs.readFileSync(file,"utf8")); } catch { return { showTopBar:true, showFooter:true }; } }
function writeOne(v: HF){ if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true}); fs.writeFileSync(file, JSON.stringify(v,null,2), "utf8"); }
function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method==="GET") return res.status(200).json(readOne());
  if(req.method==="PUT"||req.method==="POST"){ const v={...readOne(),...req.body}; writeOne(v); return res.status(200).json(v); }
  return res.status(405).json({error:"Method not allowed"});
}
