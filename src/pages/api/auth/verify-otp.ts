import type { NextApiRequest, NextApiResponse } from "next";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Role } from "@/lib/rbac";

const DATA = path.join(process.cwd(), ".data");
const OTPF = path.join(DATA, "otp.json");
const USERS = path.join(DATA, "users.json");
const DEFAULT_ROLE: Role = "individual_tenant";

async function ensure(){ try{await access(DATA)}catch{await mkdir(DATA,{recursive:true})}
  for(const f of [OTPF,USERS]){ try{await access(f)}catch{await writeFile(f, JSON.stringify({items:[]},null,2), "utf8")} } }
async function readJSON(p:string){ const raw=await readFile(p,"utf8").catch(()=> '{"items":[]}'); return JSON.parse(raw||'{"items":[]}'); }
async function writeJSON(p:string,d:any){ await writeFile(p, JSON.stringify(d,null,2), "utf8"); }

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  await ensure();
  if(req.method!=="POST"){ res.setHeader("Allow","POST"); return res.status(405).json({error:"Method Not Allowed"}); }
  const { phone, code, name } = req.body as { phone?:string; code?:string; name?:string };
  if(!phone || !code) return res.status(400).json({ error:"phone and code required" });

  const otp = await readJSON(OTPF);
  const row = (otp.items||[]).find((x:any)=> x.phone===phone && x.code===code);
  if(!row) return res.status(400).json({ error:"invalid_code" });
  if(Number(row.expiresAt) < Date.now()) return res.status(400).json({ error:"expired" });

  const id = `wa:${phone}`;
  const users = await readJSON(USERS);
  const i = (users.items||[]).findIndex((x:any)=> x.id===id);
  if(i===-1){
    users.items=[{ id, name: name||phone, role: DEFAULT_ROLE, status:"active", createdAt: Date.now() }, ...(users.items||[])];
  }else{
    users.items[i] = { ...users.items[i], name: name||users.items[i].name };
  }
  await writeJSON(USERS, users);

  otp.items = (otp.items||[]).filter((x:any)=> !(x.phone===phone && x.code===code));
  await writeJSON(OTPF, otp);

  const u = (users.items||[]).find((x:any)=> x.id===id)!;
  res.setHeader("Set-Cookie", [
    `uid=${encodeURIComponent(u.id)}; Path=/; SameSite=Lax`,
    `uname=${encodeURIComponent(u.name)}; Path=/; SameSite=Lax`,
    `urole=${encodeURIComponent(u.role as Role)}; Path=/; SameSite=Lax`,
  ]);
  return res.status(200).json({ ok:true, user:{ id:u.id, name:u.name, role:u.role as Role } });
}
