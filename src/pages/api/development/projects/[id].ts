import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

type Project = { id: string; [k: string]: any };
const DATA_PATH = path.join(process.cwd(), "data", "development.projects.json");
const CFG_PATH  = path.join(process.cwd(), "data", "config.json");

function readAll(): Project[] { if (!fs.existsSync(DATA_PATH)) return []; return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8") || "[]"); }
function writeAll(arr: Project[]) { fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true }); fs.writeFileSync(DATA_PATH, JSON.stringify(arr, null, 2), "utf-8"); }
function readCfg(): any { if (!fs.existsSync(CFG_PATH)) return {}; return JSON.parse(fs.readFileSync(CFG_PATH, "utf-8") || "{}"); }

async function notifyWebhooks(event: string, payload: any) {
  try {
    const cfg = readCfg();
    if (!cfg?.features?.webhooks) return;
    const hooks: string[] = cfg?.webhooks || [];
    await Promise.all(hooks.map(async (url) => {
      try { await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event, payload }) }); } catch (_e) {}
    }));
  } catch (_e) {}
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const id = String(req.query.id || "");
    const all = readAll();
    const idx = all.findIndex(p => p.id === id);

    if (req.method === "GET") {
      const item = idx >= 0 ? all[idx] : null;
      if (!item) return res.status(404).json({ error: "not_found" });
      return res.status(200).json({ item });
    }

    if (req.method === "PUT") {
      if (idx < 0) return res.status(404).json({ ok: false, error: "not_found" });
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const merged = { ...all[idx], ...body, id, updatedAt: new Date().toISOString() };
      if (merged.draft && body && Object.keys(body).length) merged.draft = false;
      all[idx] = merged; writeAll(all);
      await notifyWebhooks("project.updated", merged);
      return res.status(200).json({ ok: true, item: merged });
    }

    res.setHeader("Allow", "GET,PUT");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: "server_error", message: e?.message });
  }
}
