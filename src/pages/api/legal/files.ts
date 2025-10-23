// src/pages/api/legal/files.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { Documents } from "@/server/legal/store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const name = req.query.name as string;
  if (!name) return res.status(400).send("name required");
  const filePath = path.join(Documents.storageDir(), name);
  if (!fs.existsSync(filePath)) return res.status(404).send("not found");
  const stat = fs.statSync(filePath);
  res.setHeader("Content-Length", stat.size.toString());
  res.setHeader("Content-Type", "application/octet-stream");
  fs.createReadStream(filePath).pipe(res);
}
