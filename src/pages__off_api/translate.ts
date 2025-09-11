// src/pages/api/translate.ts //
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * ترجمة وهمية: تعيد نفس النص لكل لغة.
 * استبدل logic هنا لاحقًا بالاتصال بمزوّد ترجمة حقيقي.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { text, from, to } = req.body || {};
  const arr: string[] = Array.isArray(to) ? to : [];
  const result: Record<string,string> = {};
  arr.forEach((lang) => { result[lang] = String(text ?? ""); });
  res.status(200).json({ ok: true, from: String(from ?? ""), translations: result });
}
