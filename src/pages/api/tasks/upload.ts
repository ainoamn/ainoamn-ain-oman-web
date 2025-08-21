import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const UP = path.join(process.cwd(), "public", "uploads");

// ارفع حتى 50MB (يمكن تعديلها لاحقًا)
export const config = { api: { bodyParser: { sizeLimit: "50mb" } } };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ ok: false, error: "method_not_allowed" });
    }
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    // يدعم dataURL أو Base64 مباشرة
    const data: string = body?.data || "";
    let filename: string = (body?.filename || "upload").replace(/[^a-z0-9\.\-_]/gi, "_");

    if (!data) return res.status(400).json({ ok: false, error: "data_required" });

    // استخرج الـ MIME إن وُجد
    let ext = "";
    const m = data.match(/^data:(.+?);base64,(.+)$/);
    const base64 = m ? m[2] : data;
    if (m && m[1]) {
      const mt = m[1]; // example: application/pdf
      const guess = mt.split("/")[1]?.split(";")[0] || "";
      if (guess && !filename.includes(".")) ext = "." + guess.replace(/[^a-z0-9]/gi, "");
    }
    if (!fs.existsSync(UP)) fs.mkdirSync(UP, { recursive: true });

    const stamp = Date.now();
    const finalName = `${stamp}-${filename}${ext && !filename.includes(".") ? ext : ""}`;
    const final = path.join(UP, finalName);
    fs.writeFileSync(final, Buffer.from(base64, "base64"));

    const url = `/uploads/${path.basename(final)}`;
    return res.status(200).json({ ok: true, url, name: path.basename(final), size: Buffer.byteLength(base64, "base64") });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: "server_error", message: e?.message });
  }
}
