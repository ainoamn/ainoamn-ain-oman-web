// src/pages/api/admin/dev/sections.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { ADMIN_MODULES } from "@/lib/admin/registry";

type Section = {
  id: string;
  title: string;
  href: string;
  group?: string;
  useCentral?: boolean;
  titleKey?: string;
  order?: number;
};

const dir = path.join(process.cwd(), ".data");
const file = path.join(dir, "admin-sections.json");

function readAll(): Section[] {
  try {
    const list: Section[] = JSON.parse(fs.readFileSync(file, "utf8"));
    return list
      .map((x, i) => ({ ...x, order: typeof x.order === "number" ? x.order : i }))
      .sort((a, b) => (a.order! - b.order!));
  } catch {
    return [];
  }
}
function writeAll(list: Section[]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(list, null, 2), "utf8");
}
function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const list = readAll();
    const groups = Array.from(new Set(list.map((s) => s.group).filter(Boolean)));
    return res.status(200).json({ sections: list, groups });
  }

  if (req.method === "POST") {
    const b = req.body || {};
    const id = String((b.id || "").trim() || crypto.randomUUID());

    // منع التعارض مع الموديولات المدمجة
    const builtinIds = new Set((ADMIN_MODULES as any[]).map((m: any) => m.id));
    if (builtinIds.has(id)) {
      return res.status(409).json({ error: "id collides with builtin module" });
    }

    const title = String((b.title || "").trim() || id);
    const titleKey = b.titleKey ? String(b.titleKey).trim() : undefined;
    const useCentral = Boolean(b.useCentral);
    const href = useCentral
      ? `/admin/dashboard?section=${encodeURIComponent(id)}`
      : String((b.href || "").trim() || `/admin/${id}`);
    const group = String((b.group || "custom").trim());

    const list = readAll();
    const idx = list.findIndex((x) => x.id === id);
    const order = idx >= 0 ? list[idx].order : list.length;
    const next: Section = { id, title, titleKey, href, group, useCentral, order };
    if (idx >= 0) list[idx] = next; else list.push(next);
    writeAll(list);
    return res.status(200).json({ section: next });
  }

  if (req.method === "PUT") {
    const id = String(req.query.id || req.body?.id || "");
    if (!id) return res.status(400).json({ error: "id required" });
    const list = readAll();
    const i = list.findIndex((x) => x.id === id);
    if (i < 0) return res.status(404).json({ error: "not found" });

    const b = req.body || {};
    const useCentral = b.useCentral ?? list[i].useCentral;
    list[i] = {
      ...list[i],
      title: typeof b.title === "string" ? b.title : list[i].title,
      titleKey: typeof b.titleKey === "string" ? b.titleKey : list[i].titleKey,
      group: typeof b.group === "string" ? b.group : list[i].group,
      useCentral,
      href:
        typeof b.href === "string"
          ? b.href
          : useCentral
          ? `/admin/dashboard?section=${encodeURIComponent(id)}`
          : list[i].href,
    };
    writeAll(list);
    return res.status(200).json({ section: list[i] });
  }

  if (req.method === "PATCH") {
    // إعادة ترتيب: body = { order: ["id1","id2",...] }
    const ids: string[] = Array.isArray(req.body?.order) ? req.body.order.map(String) : [];
    if (!ids.length) return res.status(400).json({ error: "order required" });

    const list = readAll();
    const map = new Map(list.map((x) => [x.id, x]));
    const reordered: Section[] = [];
    ids.forEach((id, idx) => {
      const it = map.get(id);
      if (it) {
        it.order = idx;
        reordered.push(it);
        map.delete(id);
      }
    });
    [...map.values()].forEach((it) => {
      it.order = reordered.length;
      reordered.push(it);
    });
    writeAll(reordered);
    return res.status(200).json({ sections: reordered });
  }

  if (req.method === "DELETE") {
    const id = String(req.query.id || req.body?.id || "");
    if (!id) return res.status(400).json({ error: "id required" });
    const next = readAll().filter((x) => x.id !== id).map((x, i) => ({ ...x, order: i }));
    writeAll(next);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
