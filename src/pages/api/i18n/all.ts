// src/pages/api/i18n/all.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import path from "path";

const LOCALES_DIR = path.join(process.cwd(), "src", "locales");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const files = await fs.readdir(LOCALES_DIR);
    const dicts: Record<string, Record<string, string>> = {};
    const langs: string[] = [];
    for (const f of files) {
      if (!f.endsWith(".json") || f.startsWith("_")) continue;
      const lang = path.basename(f, ".json");
      const raw = await fs.readFile(path.join(LOCALES_DIR, f), "utf8");
      try {
        dicts[lang] = JSON.parse(raw);
        langs.push(lang);
      } catch {
        // ملف تالف: تجاوزه
      }
    }
    langs.sort();
    return res.status(200).json({ langs, dicts, meta: {} });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "read_failed" });
  }
}
