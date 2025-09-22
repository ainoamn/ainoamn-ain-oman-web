import type { NextApiRequest, NextApiResponse } from "next";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Role } from "@/lib/rbac";

const DATA = path.join(process.cwd(), ".data");
const USERS = path.join(DATA, "users.json");
const DEFAULT_ROLE: Role = "individual_tenant";

async function ensure(){ try{await access(DATA)}catch{await mkdir(DATA,{recursive:true})}
  try{await access(USERS)}catch{await writeFile(USERS, JSON.stringify({items:[]},null,2), "utf8")} }
async function readDB(){ const raw=await readFile(USERS,"utf8").catch(()=> '{"items":[]}'); return JSON.parse(raw||'{"items":[]}'); }
async function writeDB(d:any){ await writeFile(USERS, JSON.stringify(d,null,2), "utf8"); }

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  await ensure();

  if(req.method!=="POST"){ res.setHeader("Allow","POST"); return res.status(405).json({ error:"Method Not Allowed" }); }

  // body: { method: "google"|"microsoft"|"custom", id: string, name?: string, email?: string }
  const b = req.body as { method:string; id?:string; name?:string; email?:string };
  if(!b?.id) return res.status(400).json({ error:"id required" });

  const db = await readDB();
  const i = (db.items||[]).findIndex((x:any)=> x.id===b.id);
  if(i===-1){
    db.items=[{ id:b.id, name:b.name||b.email||"User", role: DEFAULT_ROLE, status:"active", createdAt: Date.now() }, ...(db.items||[])];
  }else{
    db.items[i] = { ...db.items[i], name: b.name||db.items[i].name }; // الدور محفوظ من قبل
  }
  await writeDB(db);

  const user = (db.items||[]).find((x:any)=> x.id===b.id)!;
  res.setHeader("Set-Cookie", [
    `uid=${encodeURIComponent(user.id)}; Path=/; SameSite=Lax`,
    `uname=${encodeURIComponent(user.name)}; Path=/; SameSite=Lax`,
    `urole=${encodeURIComponent(user.role as Role)}; Path=/; SameSite=Lax`,
  ]);
  return res.status(200).json({ ok:true, user:{ id:user.id, name:user.name, role:user.role } });
}
