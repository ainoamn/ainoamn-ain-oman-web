// src/pages/api/i18n/mt.ts
import type { NextApiRequest, NextApiResponse } from "next";

type Provider = "deepl" | "google" | "libre";
type Body = { text: string; source?: string; targets: string[]; provider?: Provider };

const hasDeepL = !!process.env.DEEPL_API_KEY;
const hasGoogle = !!process.env.GOOGLE_TRANSLATE_API_KEY;
const hasLibre  = !!process.env.LIBRETRANSLATE_URL;

const DEEPL_SUPPORTED = new Set([
  "ar","bg","zh","cs","da","nl","en","et","fi","fr","de","el","hu","id","it",
  "ja","ko","lv","lt","nb","pl","pt","ro","ru","sk","sl","es","sv","tr","uk"
]); // راجع قائمة DeepL. :contentReference[oaicite:1]{index=1}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      configured: { deepl: hasDeepL, google: hasGoogle, libre: hasLibre },
      default: process.env.I18N_MT_PROVIDER || "deepl"
    });
  }
  if (req.method !== "POST") return res.status(405).end();

  const { text, source, targets, provider } = (req.body || {}) as Body;
  if (!text || !targets?.length) return res.status(400).json({ error: "bad request" });

  // اختر مزوّدًا فعليًا متاحًا
  const pref = (provider || (process.env.I18N_MT_PROVIDER as Provider) || "deepl") as Provider;
  const chain = pickChain(pref);

  const out: Record<string, string> = {};
  for (const trg of targets) {
    const src = (source || "auto").toLowerCase();
    let translated = "";

    for (const p of chain) {
      try {
        if (p === "deepl" && DEEPL_SUPPORTED.has(trg)) {
          translated = await trDeepl(text, src, trg);
        } else if (p === "google") {
          translated = await trGoogle(text, src, trg);
        } else if (p === "libre") {
          translated = await trLibre(text, src, trg);
        }
      } catch { /* جرّب التالي */ }
      if (translated) break;
    }
    out[trg] = translated || "";
  }

  return res.status(200).json({ translations: out });
}

function pickChain(pref: Provider): Provider[] {
  const avail: Provider[] = [];
  if (hasDeepL) avail.push("deepl");
  if (hasGoogle) avail.push("google");
  if (hasLibre)  avail.push("libre");
  // إن لم يوجد أي مزوّد مهيأ
  if (!avail.length) return [];
  // أعد ترتيب القائمة بوضع المفضّل أولًا إن كان موجودًا
  const set = new Set<Provider>([pref, ...avail]);
  return [...set].filter(p => (p === "deepl" ? hasDeepL : p === "google" ? hasGoogle : hasLibre));
}

async function trDeepl(q: string, source: string, target: string): Promise<string> {
  if (!hasDeepL) return "";
  const { Translator } = await import("deepl-node");
  const t = new Translator(process.env.DEEPL_API_KEY!);
  const r = await t.translateText(q, source === "auto" ? null : source.toUpperCase(), target.toUpperCase());
  return r?.text || "";
}

async function trGoogle(q: string, source: string, target: string): Promise<string> {
  if (!hasGoogle) return "";
  const r = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q, source: source === "auto" ? undefined : source, target, format: "text" })
  }).then(r => r.json());
  return r?.data?.translations?.[0]?.translatedText || "";
}

async function trLibre(q: string, source: string, target: string): Promise<string> {
  if (!hasLibre) return "";
  const base = process.env.LIBRETRANSLATE_URL!.replace(/\/$/, "");
  const r = await fetch(`${base}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q, source: source === "auto" ? "auto" : source, target, format: "text" })
  }).then(r => r.json());
  return r?.translatedText || "";
}
