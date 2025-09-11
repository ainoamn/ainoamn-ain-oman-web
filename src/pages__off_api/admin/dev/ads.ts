// src/pages/api/admin/dev/ads.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs"; import path from "path";
type Placement = { html?: string; imageUrl?: string; link?: string; enabled?: boolean };
type Ads = { bannerTop?: Placement; sidebar?: Placement; modal?: Placement };
const dir = path.join(process.cwd(), ".data");
const file = path.join(dir, "ads.json");
function readOne(): Ads { try { return JSON.parse(fs.readFileSync(file,"utf8")); } catch { return {}; } }
function writeOne(v: Ads){ if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true}); fs.writeFileSync(file, JSON.stringify(v,null,2), "utf8"); }
export default function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method==="GET") return res.status(200).json(readOne());
  if(req.method==="PUT"||req.method==="POST"){ const v={...readOne(),...req.body}; writeOne(v); return res.status(200).json(v); }
  return res.status(405).json({error:"Method not allowed"});
}
