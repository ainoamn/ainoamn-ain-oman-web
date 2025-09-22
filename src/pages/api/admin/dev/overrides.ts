// src/pages/api/admin/dev/overrides.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs"; import path from "path";

type Override = { id: string; title?: string; titleKey?: string; group?: string; href?: string; hidden?: boolean; useCentral?: boolean };
const dir = path.join(process.cwd(), ".data");
const file = path.join(dir, "admin-overrides.json");
const orderFile = path.join(dir, "admin-order.json");

function readOverrides(): Override[] { try { return JSON.parse(fs.readFileSync(file,"utf8")); } catch { return []; } }
function writeOverrides(v: Override[]){ if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true}); fs.writeFileSync(file, JSON.stringify(v,null,2),"utf8"); }
function readOrder(): string[] { try { const j=JSON.parse(fs.readFileSync(orderFile,"utf8")); return Array.isArray(j?.order)? j.order: []; } catch { return []; } }
function writeOrder(order: string[]){ if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true}); fs.writeFileSync(orderFile, JSON.stringify({order},null,2),"utf8"); }
function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method==="GET")  return res.status(200).json({ overrides: readOverrides(), order: readOrder() });
  if(req.method==="PUT"||req.method==="POST"){
    const id = String(req.query.id || req.body?.id || "").trim(); if(!id) return res.status(400).json({error:"id required"});
    const list = readOverrides(); const i = list.findIndex(o=>o.id===id);
    const merged: Override = { ...(list[i]||{id}), ...req.body, id };
    if(i>=0) list[i]=merged; else list.push(merged);
    writeOverrides(list); return res.status(200).json({ override: merged });
  }
  if(req.method==="DELETE"){
    const id = String(req.query.id || req.body?.id || "").trim(); if(!id) return res.status(400).json({error:"id required"});
    writeOverrides(readOverrides().filter(o=>o.id!==id)); return res.status(200).json({ ok:true });
  }
  if(req.method==="PATCH"){
    const arr = Array.isArray(req.body?.order)? req.body.order.map(String): [];
    if(!arr.length) return res.status(400).json({error:"order required"});
    writeOrder(arr); return res.status(200).json({ order: arr });
  }
  return res.status(405).json({error:"Method not allowed"});
}
