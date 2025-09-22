/**
 * API Route: /api/admin/settings/actions
 * Methods:
 *  - GET: return current ActionsSettings
 *  - PUT: replace ActionsSettings (body: ActionsSettings)
 *
 * File storage: .data/actions-settings.json (server-side only)
 *
 * Location: src/pages/api/admin/settings/actions.ts
 */
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import {
  ActionsSettings,
  BuiltinActionKey,
  BuiltinActionSetting,
} from "@/types/actions-settings";

const dataDir = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "actions-settings.json");

const DEFAULT_BUILTINS: BuiltinActionKey[] = [
  "chatOwner",
  "contactAdmin",
  "requestViewing",
  "negotiatePrice",
  "reserveProperty",
];

const DEFAULT_SETTINGS: ActionsSettings = {
  builtin: DEFAULT_BUILTINS.map((key) => ({ key, enabled: true })) as BuiltinActionSetting[],
  custom: [],
  showAnnualPrice: true,
  iconSize: 18,
};

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(DEFAULT_SETTINGS, null, 2), "utf8");
  }
}

function readSettings(): ActionsSettings {
  ensureDataFile();
  const raw = fs.readFileSync(dataFile, "utf8");
  return JSON.parse(raw) as ActionsSettings;
}

function writeSettings(s: ActionsSettings) {
  ensureDataFile();
  fs.writeFileSync(dataFile, JSON.stringify(s, null, 2), "utf8");
}
function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const s = readSettings();
      return res.status(200).json(s);
    }
    if (req.method === "PUT") {
      const body = req.body;
      if (!body || typeof body !== "object") {
        return res.status(400).json({ error: "Invalid body" });
      }
      const s = body as ActionsSettings;

      // sanitize builtins
      const seen = new Set<string>();
      s.builtin = (Array.isArray(s.builtin) ? s.builtin : []).filter((b) => {
        if (!b || !b.key) return false;
        if (!DEFAULT_BUILTINS.includes(b.key)) return false;
        if (seen.has(b.key)) return false;
        seen.add(b.key);
        return typeof b.enabled === "boolean";
      });

      // sanitize custom
      s.custom = (Array.isArray(s.custom) ? s.custom : [])
        .filter((c) => {
          if (!c || typeof c !== "object") return false;
          if (!c.id || typeof c.id !== "string") return false;
          if (!c.labelAr || !c.labelEn) return false;
          if (!c.kind || !["link", "modal"].includes(c.kind)) return false;
          if (c.kind === "link" && !c.url) return false;
          if (c.kind === "modal" && !c.modalId) return false;
          if (typeof c.enabled !== "boolean") return false;
          if (typeof c.order !== "number") c.order = 0;
          return true;
        })
        .sort((a, b) => a.order - b.order);

      if (typeof s.showAnnualPrice !== "boolean") s.showAnnualPrice = true;
      if (typeof s.iconSize !== "number") s.iconSize = 18;

      writeSettings(s);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET,PUT");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err?.message || "Internal Server Error" });
  }
}
