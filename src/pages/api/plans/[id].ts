import type { NextApiRequest, NextApiResponse } from "next";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "plans.json");
async function ensure(){ try{await access(DATA_DIR)}catch{await mkdir(DATA_DIR,{recursive:true})} try{await access(FILE)}catch{await writeFile(FILE, JSON.stringify({items:[]},null,2),"utf8")} }

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  await ensure();
  const { id } = req.query as { id:string };
  const raw=await readFile(FILE,"utf8").catch(()=> '{"items":[]}');
  const data=JSON.parse(raw||'{"items":[]}');
  const items=data.items||[];
  const i=items.findIndex((x:any)=> String(x.id)===String(id));
  if(i===-1) return res.status(404).json({ error:"Not found" });

  if(req.method==="PUT"){
    const next={ ...items[i], ...(req.body||{}), id };
    items[i]=next;
    await writeFile(FILE, JSON.stringify({items},null,2),"utf8");
    return res.status(200).json({ ok:true, item: next });
  }
  if(req.method==="DELETE"){
    const rest=items.filter((x:any)=> String(x.id)!==String(id));
    await writeFile(FILE, JSON.stringify({items:rest},null,2),"utf8");
    return res.status(200).json({ ok:true });
  }

  res.setHeader("Allow","PUT, DELETE");
  return res.status(405).json({ error:"Method Not Allowed" });
}
