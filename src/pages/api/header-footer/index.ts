import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "header-footer.json");

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify({ header: {}, footer: {} }, null, 2), "utf8");
}
function handler(req: NextApiRequest, res: NextApiResponse) {
  ensure();
  if (req.method === "GET") {
    const raw = fs.readFileSync(FILE, "utf8");
    return res.status(200).json(JSON.parse(raw));
  }
  if (req.method === "POST") {
    try {
      const body = req.body || {};
      fs.writeFileSync(FILE, JSON.stringify(body, null, 2), "utf8");
      return res.status(200).json({ ok: true });
    } catch (e: any) {
      return res.status(400).json({ ok: false, error: e?.message || "Bad request" });
    }
  }
  res.setHeader("Allow", "GET, POST");
  return res.status(405).end("Method Not Allowed");
}
