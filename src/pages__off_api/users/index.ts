import type { NextApiRequest, NextApiResponse } from "next";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA = path.join(process.cwd(), ".data");
const USERS = path.join(DATA, "users.json");
type Status = "active"|"restricted"|"banned";
type User = { id:string; name:string; status:Status; createdAt:number; meta?:Record<string,any> };

async function ensure(){ try{await access(DATA)}catch{await mkdir(DATA,{recursive:true})}
  try{await access(USERS)}catch{await writeFile(USERS, JSON.stringify({items:[]},null,2),"utf8")} }
async function readDB(){ const raw=await readFile(USERS,"utf8").catch(()=> '{"items":[]}'); return JSON.parse(raw||'{"items":[]}'); }
async function writeDB(d:any){ await writeFile(USERS, JSON.stringify(d,null,2), "utf8"); }

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  await ensure();

  if(req.method==="GET"){
    const { q, status } = req.query as { q?:string; status?:Status };
    const db = await readDB();
    let items:User[] = db.items||[];
    if(q){ const n=q.toLowerCase(); items=items.filter(u=> u.id.toLowerCase().includes(n) || u.name.toLowerCase().includes(n)); }
    if(status){ items=items.filter(u=> u.status===status); }
    items=items.sort((a,b)=> b.createdAt-a.createdAt);
    return res.status(200).json({ items });
  }

  if(req.method==="POST"){
    const b = req.body as Partial<User>;
    if(!b?.id || !b?.name) return res.status(400).json({ error:"id,name required" });
    const db = await readDB();
    const i = (db.items||[]).findIndex((x:any)=> x.id===b.id);
    const item:User = { id:String(b.id), name:String(b.name), status:(b.status as Status)||"active", createdAt: Date.now(), meta: b.meta&&typeof b.meta==="object"? b.meta: undefined };
    if(i===-1) db.items=[item, ...(db.items||[])];
    else db.items[i]={...db.items[i], ...item, createdAt: db.items[i].createdAt};
    await writeDB(db);
    return res.status(201).json({ ok:true });
  }

  res.setHeader("Allow","GET, POST");
  return res.status(405).json({ error:"Method Not Allowed" });
}
