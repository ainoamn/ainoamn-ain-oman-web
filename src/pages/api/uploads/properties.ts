// root: src/pages/api/uploads/properties.ts
import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const folder = String(req.query.folder || Date.now());
  const targetDir = path.resolve(process.cwd(), "public", "uploads", "properties", folder);
  fs.mkdirSync(targetDir, { recursive: true });

  const form = formidable({ multiples: true, uploadDir: targetDir, keepExtensions: true });
  form.parse(req, async (err, _fields, files) => {
    if (err) return res.status(500).json({ error: "upload_failed" });

    const all = Array.isArray(files.file)
      ? files.file
      : (files.file ? [files.file] : Object.values(files));

    const urls: string[] = [];
    for (const anyF of all as any[]) {
      const fp = anyF.filepath || anyF.path || anyF.location || anyF.tempFilePath;
      if (!fp) continue;
      const filename = path.basename(fp);
      urls.push(`/uploads/properties/${folder}/${filename}`);
    }
    return res.status(200).json({ ok: true, urls, folder });
  });
}
