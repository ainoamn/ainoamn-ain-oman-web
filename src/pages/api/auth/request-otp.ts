import type { NextApiRequest, NextApiResponse } from "next";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA = path.join(process.cwd(), ".data");
const OTPF = path.join(DATA, "otp.json");

async function ensure() {
  try { await access(DATA); } catch { await mkdir(DATA, { recursive: true }); }
  try { await access(OTPF); } catch { await writeFile(OTPF, JSON.stringify({ items: [] }, null, 2), "utf8"); }
}
async function readDB() { const raw = await readFile(OTPF, "utf8").catch(()=> '{"items":[]}'); return JSON.parse(raw||'{"items":[]}'); }
async function writeDB(d:any){ await writeFile(OTPF, JSON.stringify(d,null,2), "utf8"); }

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  await ensure();
  if(req.method!=="POST"){ res.setHeader("Allow","POST"); return res.status(405).json({error:"Method Not Allowed"}); }
  const { phone } = req.body as { phone?:string };
  if(!phone) return res.status(400).json({ error:"phone required" });
  const code = String(Math.floor(100000 + Math.random()*900000));
  const exp = Date.now() + 5*60*1000;

  const db = await readDB();
  db.items = [{ phone, code, expiresAt: exp }, ...(db.items||[]).filter((x:any)=> x.phone!==phone)];
  await writeDB(db);

  // TODO: ربط واتساب API لإرسال الكود فعليًا
  return res.status(200).json({ ok:true, demoCode: code });
}
