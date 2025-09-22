// src/pages/api/i18n/index.ts  (يحفظ/يقرأ desc أيضًا)
import type { NextApiRequest, NextApiResponse } from "next";
import { addLang, readDicts, readMeta, unionKeys, writeAll, getLangs } from "@/server/i18n-admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = process.env.I18N_ADMIN_TOKEN;
  if (token && req.headers["x-admin-token"] !== token) return res.status(401).json({ error: "unauthorized" });

  if (req.method === "GET") {
    const dicts = await readDicts();
    const meta = await readMeta();
    return res.status(200).json({ langs: await getLangs(), keys: unionKeys(dicts), dicts, meta });
  }

  if (req.method === "POST") {
    const { action } = req.body || {};
    if (action === "addLang") {
      const { lang } = req.body || {};
      if (!lang) return res.status(400).json({ error: "missing lang" });
      await addLang(String(lang));
      const dicts = await readDicts();
      const meta = await readMeta();
      return res.status(200).json({ langs: await getLangs(), keys: unionKeys(dicts), dicts, meta });
    }
    if (action === "save") {
      const { dicts, meta } = req.body || {};
      if (!dicts) return res.status(400).json({ error: "missing dicts" });
      await writeAll(dicts, meta || {});
      return res.status(200).json({ ok: true });
    }
    return res.status(400).json({ error: "unknown action" });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).end();
}
