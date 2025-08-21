import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export const config = {
  api: { bodyParser: { sizeLimit: "50mb" } }, // تكبير الحد لحجم الملفات
};

const UP_DIR = path.join(process.cwd(), "public", "uploads");

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9\.\-\_\u0600-\u06FF]/g, "_");
}
function guessExtFromMime(m?: string) {
  if (!m) return "";
  if (m.includes("pdf")) return ".pdf";
  if (m.includes("msword")) return ".doc";
  if (m.includes("officedocument.wordprocessingml")) return ".docx";
  if (m.includes("officedocument.spreadsheetml")) return ".xlsx";
  if (m.includes("excel")) return ".xls";
  if (m.includes("officedocument.presentationml")) return ".pptx";
  if (m.includes("powerpoint")) return ".ppt";
  if (m.startsWith("image/")) return "." + m.split("/")[1];
  if (m.startsWith("text/")) return ".txt";
  return "";
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ ok: false, error: "method_not_allowed" });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const data: string = body?.data || "";            // dataURL أو base64
    const original: string = body?.filename || "file";
    const clean = sanitizeName(original);

    if (!data) return res.status(400).json({ ok: false, error: "data_required" });

    let base64 = data;
    let ext = path.extname(clean);
    let mime: string | undefined;

    // دعم dataURL: data:<mime>;base64,<content>
    const m = data.match(/^data:(.+?);base64,(.+)$/);
    if (m) {
      mime = m[1];
      base64 = m[2];
      if (!ext) ext = guessExtFromMime(mime);
    }

    const buf = Buffer.from(base64, "base64");
    if (!fs.existsSync(UP_DIR)) fs.mkdirSync(UP_DIR, { recursive: true });

    const stamp = Date.now();
    const fname = `${stamp}-${path.basename(clean, path.extname(clean))}${ext || ""}`;
    const final = path.join(UP_DIR, fname);

    fs.writeFileSync(final, buf);
    const url = `/uploads/${fname}`;

    return res.status(200).json({ ok: true, url, mime: mime || null, name: fname });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: "server_error", message: e?.message });
  }
}
