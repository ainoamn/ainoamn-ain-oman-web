import type { NextApiRequest, NextApiResponse } from "next";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA = path.join(process.cwd(), ".data");
const USERS = path.join(DATA, "users.json");
async function ensure(){ try{await access(DATA)}catch{await mkdir(DATA,{recursive:true})} try{await access(USERS)}catch{await writeFile(USERS, JSON.stringify({items:[]},null,2),"utf8")} }
async function readDB(){ const raw=await readFile(USERS,"utf8").catch(()=> '{"items":[]}'); return JSON.parse(raw||'{"items":[]}'); }
async function writeDB(d:any){ await writeFile(USERS, JSON.stringify(d,null,2), "utf8"); }

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  await ensure();
  const { id } = req.query as { id:string };
  const db = await readDB();
  const i = (db.items||[]).findIndex((x:any)=> x.id===id);
  if(req.method==="GET"){
    if(i===-1) return res.status(404).json({ error:"Not found" });
    return res.status(200).json({ item: db.items[i] });
  }
  if(req.method==="PUT"){
    if(i===-1) return res.status(404).json({ error:"Not found" });
    db.items[i]={ ...db.items[i], ...(req.body||{}), id };
    await writeDB(db);
    return res.status(200).json({ ok:true, item: db.items[i] });
  }
  res.setHeader("Allow","GET, PUT");
  return res.status(405).json({ error:"Method Not Allowed" });
}
