// src/pages/api/properties/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { readJson, writeJson } from "../../../server/fsdb";
import { PROPERTIES } from "../../../lib/demoData";

type StoredProp = {
  id: number;
  serial: string;
  title: string;
  title_i18n?: Record<string, string>;
  description_i18n?: Record<string, string>;
  location: string;
  priceOMR: number;
  image: string;
  beds?: number;
  baths?: number;
  area?: number;
  rating?: number;
  lat?: number;
  lng?: number;
  type?: "apartment"|"villa"|"land"|"office"|"shop";
  purpose?: "sale"|"rent"|"investment";
  rentalType?: "daily"|"monthly"|"yearly"|null;
  province: string;
  state: string;
  village?: string|null;
  promoted?: boolean;
  promotedAt?: string|null;
  views?: number;
  amenities?: string[];
  attractions?: string[];
  createdAt?: string;
  ownerTarget?: string;
  images?: string[];
};

const FILE = "properties.json";

function nextId(all: StoredProp[]) {
  const demoMax = Math.max(0, ...PROPERTIES.map(p => Number(p.id) || 0));
  const storedMax = Math.max(0, ...all.map(p => Number(p.id) || 0));
  return Math.max(demoMax, storedMax) + 1;
}
function makeSerial(id: number) {
  return `AO-P-${String(id).padStart(7, "0")}`;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const stored = readJson<StoredProp[]>(FILE, []);
    const items = [...stored, ...PROPERTIES];
    return res.status(200).json({ items });
  }

  if (req.method === "POST") {
    const b = req.body || {};
    if (!b?.title?.ar && !b?.title?.en) {
      return res.status(400).json({ ok: false, error: "title_required_ar_or_en" });
    }
    if (!b?.priceOMR || !b?.province || !b?.state) {
      return res.status(400).json({ ok: false, error: "missing_required_fields" });
    }

    const all = readJson<StoredProp[]>(FILE, []);
    const id = nextId(all);
    const now = new Date().toISOString();

    const record: StoredProp = {
      id,
      serial: makeSerial(id),
      title: b.title?.ar || b.title?.en || "",
      title_i18n: b.title || {},
      description_i18n: b.description || {},
      location: `${b.province} - ${b.state}${b.village ? " - " + b.village : ""}`,
      priceOMR: Number(b.priceOMR),
      image: (b.images?.[0]) || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
      beds: Number(b.beds || 0),
      baths: Number(b.baths || 0),
      area: Number(b.area || 0),
      rating: Number(b.rating || 0),
      lat: Number(b.lat || 0),
      lng: Number(b.lng || 0),
      type: b.type,
      purpose: b.purpose,
      rentalType: b.purpose === "rent" ? (b.rentalType || null) : null,
      province: b.province,
      state: b.state,
      village: b.village || null,
      promoted: !!b.promoted,
      promotedAt: b.promoted ? now : null,
      views: 0,
      amenities: Array.isArray(b.amenities) ? b.amenities : [],
      attractions: Array.isArray(b.attractions) ? b.attractions : [],
      createdAt: now,
      ownerTarget: b.ownerTarget || "admin",
      images: Array.isArray(b.images) ? b.images : []
    };

    all.unshift(record);
    writeJson(FILE, all);
    return res.status(201).json({ ok: true, id, serial: record.serial, record });
  }

  return res.status(405).json({ ok: false, error: "method_not_allowed" });
}
