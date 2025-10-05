// src/pages/api/i18n/mt.ts
import type { NextApiRequest, NextApiResponse } from "next";

const LIBRE = process.env.LIBRETRANSLATE_URL || ""; // مثل: https://libretranslate.com/translate
const GOOGLE = process.env.GOOGLE_TRANSLATE_API_KEY || "";
const DEEPL = process.env.DEEPL_API_KEY || "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const { text = "", source = "ar", targets = [], provider = "libre" } = req.body || {};
  const out: Record<string, string> = {};

  try {
    for (const t of targets as string[]) {
      if (provider === "libre" && LIBRE) {
        const r = await fetch(LIBRE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: text, source, target: t, format: "text" }),
        }).then(r => r.json());
        out[t] = String(r?.translatedText ?? text);
      } else if (provider === "google" && GOOGLE) {
        const r = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${GOOGLE}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: text, source, target: t, format: "text" }),
        }).then(r => r.json());
        out[t] = String(r?.data?.translations?.[0]?.translatedText ?? text);
      } else if (provider === "deepl" && DEEPL) {
        const url = "https://api-free.deepl.com/v2/translate";
        const body = new URLSearchParams({ auth_key: DEEPL, text, source_lang: source.toUpperCase(), target_lang: t.toUpperCase() });
        const r = await fetch(url, { method: "POST", body }).then(r => r.json());
        out[t] = String(r?.translations?.[0]?.text ?? text);
      } else {
        out[t] = text; // بديل آمن
      }
    }
    return res.status(200).json({ translations: out });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "mt_failed", translations: {} });
  }
}
