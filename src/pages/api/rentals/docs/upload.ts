// src/pages/api/rentals/docs/upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable"; import fs from "fs"; import path from "path";
import { repo } from "@/server/rentals/workflow";
import type { DocKind, RentalDoc } from "@/server/rentals/repo";
export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const rentalId = (req.query.rentalId as string) || (req.headers["x-rental-id"] as string);
  const kind = (req.query.kind as DocKind) || "id"; if (!rentalId) return res.status(400).json({ error: "missing_rentalId" });
  const r = await repo.load(rentalId); if (!r) return res.status(404).json({ error: "rental_not_found" });

  const dir = path.resolve(process.cwd(), ".uploads/rentals", rentalId); fs.mkdirSync(dir, { recursive: true });
  const form = formidable({ multiples: false, uploadDir: dir, keepExtensions: true });
  form.parse(req, async (err, _fields, files) => {
    if (err) return res.status(500).json({ error: "upload_failed" });
    const f: any = files.file || files.upload || Object.values(files)[0];
    const filePath = f?.filepath || f?.path; if (!filePath) return res.status(400).json({ error: "file_missing" });

    const doc: RentalDoc = { id: `doc_${Date.now()}`, kind, name: path.basename(filePath), path: filePath, uploadedAt: Date.now() };
    r.docs.push(doc); await repo.save(r); return res.json({ ok: true, doc });
  });
}
