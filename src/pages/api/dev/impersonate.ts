import type { NextApiRequest, NextApiResponse } from "next";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Role } from "@/lib/rbac";

const DATA = path.join(process.cwd(), ".data");
const USERS = path.join(DATA, "users.json");

const ALLOWED: Role[] = [
  "guest","individual_tenant","corporate_tenant","basic_individual_landlord",
  "property_owner_individual_landlord","corporate_landlord","individual_property_manager",
  "service_provider","admin_staff","broker","investor","sub_user","super_admin"
];

async function ensure(){
  try{await access(DATA)}catch{await mkdir(DATA,{recursive:true})}
  try{await access(USERS)}catch{await writeFile(USERS, JSON.stringify({items:[]},null,2), "utf8")}
}
async function readUsers(){ const raw=await readFile(USERS,"utf8").catch(()=> '{"items":[]}'); return JSON.parse(raw||'{"items":[]}'); }
async function writeUsers(d:any){ await writeFile(USERS, JSON.stringify(d,null,2), "utf8"); }

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  await ensure();
  if(req.method!=="POST"){ res.setHeader("Allow","POST"); return res.status(405).json({error:"Method Not Allowed"}); }

  const { role, id, name } = req.body as { role?:Role; id?:string; name?:string };
  const r:Role = (role && ALLOWED.includes(role)) ? role : "guest";
  const uid = id?.trim() || `dev:${r}`;
  const uname = name?.trim() || (r.replace(/_/g," "));

  const db = await readUsers();
  const i = (db.items||[]).findIndex((x:any)=> x.id===uid);
  if(i===-1) db.items=[{ id:uid, name:uname, role:r, status:"active", createdAt:Date.now() }, ...(db.items||[])];
  else db.items[i] = { ...db.items[i], name:uname, role:r };
  await writeUsers(db);

  res.setHeader("Set-Cookie", [
    `uid=${encodeURIComponent(uid)}; Path=/; SameSite=Lax`,
    `uname=${encodeURIComponent(uname)}; Path=/; SameSite=Lax`,
    `urole=${encodeURIComponent(r)}; Path=/; SameSite=Lax`,
  ]);
  return res.status(200).json({ ok:true, user:{ id:uid, name:uname, role:r } });
}
