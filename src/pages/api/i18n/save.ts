// src/pages/api/i18n/save.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import path from "path";

const LOCALES_DIR = path.join(process.cwd(), "src", "locales");

function asString(v: unknown) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try { return JSON.stringify(v); } catch { return ""; }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  try {
    const body = req.body || {};
    const langs: string[] = Array.isArray(body.langs) ? body.langs : Object.keys(body.dicts || {});
    const dicts: Record<string, Record<string, string>> = body.dicts || {};
    if (!langs.length) return res.status(400).json({ error: "no_langs" });

    await fs.mkdir(LOCALES_DIR, { recursive: true });

    for (const l of langs) {
      const d = dicts[l] || {};
      const cleaned: Record<string, string> = {};
      // اكتب نصوصًا فقط
      for (const [k, v] of Object.entries(d)) cleaned[String(k)] = asString(v);
      const ordered = Object.fromEntries(Object.keys(cleaned).sort().map(k => [k, cleaned[k]]));
      const tmp = path.join(LOCALES_DIR, `.${l}.json.tmp`);
      const dst = path.join(LOCALES_DIR, `${l}.json`);
      await fs.writeFile(tmp, JSON.stringify(ordered, null, 2) + "\n", "utf8");
      await fs.rename(tmp, dst);
    }
    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "write_failed" });
  }
}
