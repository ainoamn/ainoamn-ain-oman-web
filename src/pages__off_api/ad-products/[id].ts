import type { NextApiRequest, NextApiResponse } from "next";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
const DATA = path.join(process.cwd(), ".data");
const FILE = path.join(DATA, "ad-products.json");

async function ensure(){ try{await access(DATA)}catch{await mkdir(DATA,{recursive:true})} try{await access(FILE)}catch{await writeFile(FILE,JSON.stringify({items:[]},null,2),"utf8")} }
async function readDB(){ const raw=await readFile(FILE,"utf8").catch(()=> '{"items":[]}'); return JSON.parse(raw||'{"items":[]}');}
async function writeDB(d:any){ await writeFile(FILE, JSON.stringify(d,null,2), "utf8"); }

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  await ensure();
  const { id } = req.query as { id: string };
  const db = await readDB();
  const i = (db.items||[]).findIndex((x:any)=> x.id===id);
  if (i===-1) return res.status(404).json({ error:"Not found" });

  if (req.method === "PUT") {
    db.items[i] = { ...db.items[i], ...(req.body||{}), id };
    await writeDB(db);
    return res.status(200).json({ ok:true, item: db.items[i] });
  }
  if (req.method === "DELETE") {
    db.items = (db.items||[]).filter((x:any)=> x.id!==id);
    await writeDB(db);
    return res.status(200).json({ ok:true });
  }

  res.setHeader("Allow","PUT, DELETE");
  return res.status(405).json({ error:"Method Not Allowed" });
}
