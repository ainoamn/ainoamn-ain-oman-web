// src/pages/api/ai/lang.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "@/server/auth";

const PROVIDER = process.env.TRANSLATE_PROVIDER || "local"; // local | openai

function detectLang(s: string) {
  const ar = /[\u0600-\u06FF]/.test(s);
  return ar ? "ar" : "en";
}
function correct(arOrEn: "ar"|"en", s: string) {
  let out = s.trim().replace(/\s+/g, " ");
  if (arOrEn === "ar") {
    out = out.replace(/ـ+/g, "");
    out = out.replace(/\s+([،,.!؟])/g, "$1");
  } else {
    out = out.charAt(0).toUpperCase() + out.slice(1);
    if (!/[.!?]$/.test(out)) out += ".";
  }
  return out;
}

async function translateOpenAI(text: string, target: "ar"|"en") {
  const key = process.env.OPENAI_API_KEY || "";
  if (!key) throw new Error("OPENAI_API_KEY missing");
  const sys = target === "ar"
    ? "ترجم النص ترجمة بشرية إلى العربية. اترك الأسماء أعلامًا دون تغيير."
    : "Translate the text to natural English. Keep proper nouns intact.";
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${key}`, "Content-Type":"application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role:"system", content: sys }, { role:"user", content: text }],
      temperature: 0.2
    })
  });
  const j = await r.json();
  const out = j?.choices?.[0]?.message?.content?.trim();
  if (!out) throw new Error("OpenAI translation failed");
  return out;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdminApi(req, res)) return;
  const { text, target } = req.body || {};
  if (!text) return res.status(400).json({ ok: false, error: "TEXT_REQUIRED" });

  const src = detectLang(String(text));
  const corrected = correct(src as any, String(text));
  let out = corrected;

  const tgt = (target === "ar" || target === "en") ? target : undefined;
  if (tgt && tgt !== src) {
    if (PROVIDER === "openai") {
      try { out = await translateOpenAI(corrected, tgt); }
      catch { return res.status(500).json({ ok:false, error:"TRANSLATE_PROVIDER_ERROR" }); }
    } else {
      // محلي: ترجمة تجريبية (placeholder) إن لم تُفعّل مزود خارجي
      out = corrected; // نفس النص (أقلّه التصحيح شغّال)
    }
  }

  return res.status(200).json({ ok: true, from: src, text: out });
}
