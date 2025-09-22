import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
const DATA_PATH = path.join(process.cwd(), "data", "config.json");
function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const cfg = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8") || "{}");
      return res.status(200).json({ ok: true, config: cfg });
    }
    if (req.method === "PUT") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      fs.writeFileSync(DATA_PATH, JSON.stringify(body, null, 2), "utf-8");
      return res.status(200).json({ ok: true });
    }
    res.setHeader("Allow", "GET,PUT");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: "server_error", message: e?.message });
  }
}
