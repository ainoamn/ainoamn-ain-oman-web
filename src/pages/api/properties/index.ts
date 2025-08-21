// src/pages/api/properties/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

type Property = {
  id: string;           // AO-P-######
  title: string;
  description?: string;
  priceMonthly?: number; // OMR
  currency?: string;     // default OMR
  images?: string[];
  location?: string;
  createdAt: string;     // ISO
  updatedAt: string;     // ISO
  [key: string]: any;
};

type CreatePropertyPayload = Partial<Property> & { title: string };

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE_PATH = path.join(DATA_DIR, "properties.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, "[]", "utf8");
}

function readAll(): Property[] {
  ensureStore();
  const raw = fs.readFileSync(FILE_PATH, "utf8");
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeAll(list: Property[]) {
  ensureStore();
  fs.writeFileSync(FILE_PATH, JSON.stringify(list, null, 2), "utf8");
}

function nextSerial(existing: Property[]): string {
  const prefix = "AO-P-";
  const numbers = existing
    .map((p) =>
      (p.id || "").startsWith(prefix)
        ? Number((p.id || "").slice(prefix.length))
        : 0
    )
    .filter((n) => Number.isFinite(n));
  const max = numbers.length ? Math.max(...numbers) : 0;
  const next = (max + 1).toString().padStart(6, "0");
  return `${prefix}${next}`;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { q, limit, offset } = req.query;
    const all = readAll();

    const filtered =
      typeof q === "string" && q.trim()
        ? all.filter(
            (p) =>
              (p.title || "").toLowerCase().includes(q.toLowerCase()) ||
              (p.description || "")
                .toLowerCase()
                .includes(q.toLowerCase()) ||
              (p.id || "").toLowerCase().includes(q.toLowerCase())
          )
        : all;

    const lim = Number(limit) > 0 ? Number(limit) : filtered.length;
    const off = Number(offset) > 0 ? Number(offset) : 0;

    return res.status(200).json({
      ok: true,
      total: filtered.length,
      items: filtered.slice(off, off + lim),
    });
  }

  if (req.method === "POST") {
    try {
      const body: CreatePropertyPayload =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;

      if (!body || !body.title) {
        return res.status(400).json({ ok: false, error: "title is required" });
      }

      const all = readAll();
      const now = new Date().toISOString();

      const property: Property = {
        id: nextSerial(all),
        title: body.title,
        description: body.description || "",
        priceMonthly: body.priceMonthly ?? undefined,
        currency: body.currency || "OMR",
        images: Array.isArray(body.images) ? body.images : [],
        location: body.location || "",
        createdAt: now,
        updatedAt: now,
        ...body,
      };

      // enforce authoritative fields
      property.id = property.id;
      property.createdAt = now;
      property.updatedAt = now;

      all.push(property);
      writeAll(all);
      return res.status(201).json({ ok: true, item: property });
    } catch (e: any) {
      return res
        .status(500)
        .json({ ok: false, error: e?.message || "Failed to create property" });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
