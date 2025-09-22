import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

type Unit = { id: string; [k: string]: any };
type Project = {
  id: string; title: string; city?: string; status?: "planned"|"selling"|"delivered";
  deliveryDate?: string; description?: string; amenities?: string[];
  paymentPlans?: any[]; milestones?: any[]; units?: Unit[];
  media?: any; attachments?: any[]; location?: any; finance?: any;
  listingMode?: "sale"|"rent"|"both";
  allowReservation?: boolean;
  showInAuction?: boolean;
  auction?: { startAt?: string; endAt?: string; reservePrice?: number; minIncrement?: number; path?: string };
  createdAt?: string; updatedAt?: string; draft?: boolean;
  [k: string]: any;
};

const DATA_PATH = path.join(process.cwd(), "data", "development.projects.json");
const CFG_PATH  = path.join(process.cwd(), "data", "config.json");

function readAll(): Project[] { if (!fs.existsSync(DATA_PATH)) return []; return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8") || "[]"); }
function writeAll(arr: Project[]) { fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true }); fs.writeFileSync(DATA_PATH, JSON.stringify(arr, null, 2), "utf-8"); }
function readCfg(): any { if (!fs.existsSync(CFG_PATH)) return {}; return JSON.parse(fs.readFileSync(CFG_PATH, "utf-8") || "{}"); }

function slugify(s: string) {
  const base = (s || "").toString().toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-").replace(/^-+|-+$/g, "");
  return base || "project";
}
function uniqId(title: string, all: Project[]) {
  let id = "PRJ-" + slugify(title).toUpperCase().slice(0, 16);
  if (!all.find(p => p.id === id)) return id;
  let i = 2; while (all.find(p => p.id === `${id}-${i}`)) i++; return `${id}-${i}`;
}

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
    if (req.method === "GET") {
      const all = readAll();
      const q = String(req.query.q || "").trim().toLowerCase();
      const items = q
        ? all.filter(p => p.title.toLowerCase().includes(q) || (p.city || "").toLowerCase().includes(q) || (p.status || "").toLowerCase().includes(q))
        : all;
      return res.status(200).json({ items });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (!body?.title) return res.status(400).json({ ok: false, error: "title_required" });
      const all = readAll();
      const id = body.id || uniqId(body.title, all);
      const now = new Date().toISOString();
      const item: Project = {
        id,
        title: body.title, city: body.city, status: body.status || "planned",
        deliveryDate: body.deliveryDate, description: body.description,
        amenities: body.amenities || [], paymentPlans: body.paymentPlans || [],
        milestones: body.milestones || [], units: body.units || [],
        media: body.media || {}, attachments: body.attachments || [],
        location: body.location || {}, finance: body.finance || {},
        listingMode: body.listingMode || "sale",
        allowReservation: !!body.allowReservation,
        showInAuction: !!body.showInAuction,
        auction: body.auction || {},
        createdAt: body.createdAt || now, updatedAt: now, draft: true
      };
      all.push(item); writeAll(all);
      await notifyWebhooks("project.created", item);
      return res.status(200).json({ ok: true, item });
    }

    res.setHeader("Allow", "GET,POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: "server_error", message: e?.message });
  }
}
