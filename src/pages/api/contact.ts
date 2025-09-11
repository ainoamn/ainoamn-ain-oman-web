// src/pages/api/contact.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

type Msg = { name: string; email: string; message: string; at: string; ua?: string; ip?: string };

const dir = path.join(process.cwd(), ".data");
const file = path.join(dir, "contact-messages.json");

function read(): Msg[] {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return []; }
}
function write(list: Msg[]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(list, null, 2), "utf8");
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, email, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ error: "invalid" });

  const item: Msg = {
    name: String(name).slice(0, 200),
    email: String(email).slice(0, 200),
    message: String(message).slice(0, 5000),
    at: new Date().toISOString(),
    ua: req.headers["user-agent"] as string,
    ip: (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "") as string,
  };

  const list = read();
  list.unshift(item);
  write(list);

  // ضع تكامل بريد هنا لاحقًا إن رغبت
  // await sendEmail(...)

  return res.status(200).json({ ok: true });
}
