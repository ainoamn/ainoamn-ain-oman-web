// root: src/pages/api/properties/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";
import formidable, { File as FormFile } from "formidable";
import { getById, upsert } from "@/server/properties/store";
import { normalizeUsage } from "@/lib/property";

export const config = { api: { bodyParser: false } };

function sanitizeDeep(value: any, seen = new WeakSet(), depth = 0): any {
  if (value === null || value === undefined) return value;
  const t = typeof value;
  if (t === "string") {
    if (/^data:image\/(png|jpe?g|webp);base64,/i.test(value)) return undefined;
    // Avoid extremely long strings
    if (value.length > 4_000_000) return value.slice(0, 4_000_000);
    return value;
  }
  if (t === "number" || t === "boolean") return value;
  if (t === "function") return undefined;
  if (seen.has(value)) return undefined;
  if (depth > 32) return undefined;
  seen.add(value);
  if (Array.isArray(value)) {
    const out: any[] = [];
    for (const v of value) {
      const s = sanitizeDeep(v, seen, depth + 1);
      if (s !== undefined) out.push(s);
    }
    return out;
  }
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(value)) {
    if (k === "images") continue; // handled separately
    const s = sanitizeDeep(v, seen, depth + 1);
    if (s !== undefined) out[k] = s;
  }
  return out;
}


function ensureDir(p: string) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }
function toArray<T>(x: T | T[] | undefined | null): T[] { return !x ? [] : Array.isArray(x) ? x : [x]; }
function parseMaybeJSON<T = any>(v: any): T | any { if (typeof v !== "string") return v; try { return JSON.parse(v); } catch { return v; } }
async function readJSON(req: NextApiRequest): Promise<any> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c));
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try { 
    const parsed = JSON.parse(raw);
    // إصلاح مشكلة الترميز للنصوص العربية
    return fixEncoding(parsed);
  } catch { return {}; }
}

function fixEncoding(obj: any): any {
  if (typeof obj === 'string') {
    // محاولة إصلاح الترميز المشوه
    try {
      return decodeURIComponent(escape(obj));
    } catch {
      return obj;
    }
  }
  if (Array.isArray(obj)) {
    return obj.map(fixEncoding);
  }
  if (obj && typeof obj === 'object') {
    const fixed: any = {};
    for (const [key, value] of Object.entries(obj)) {
      fixed[key] = fixEncoding(value);
    }
    return fixed;
  }
  return obj;
}
function isDataUrl(s: string) { return /^data:image\/(png|jpe?g|webp);base64,/i.test(s); }
function saveDataUrl(dataUrl: string, dir: string, idx: number): string {
  const m = /^data:image\/(png|jpe?g|webp);base64,(.+)$/i.exec(dataUrl);
  if (!m) return "";
  const ext = m[1].toLowerCase().startsWith("jp") ? "jpg" : m[1].toLowerCase();
  const buf = Buffer.from(m[2], "base64");
  const name = `img_${idx}_${Date.now()}.${ext}`;
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, buf);
  return `/uploads/properties/${path.basename(dir)}/${name}`;
}
async function parseMultipart(req: NextApiRequest, id: string): Promise<{ fields: any; files: Record<string, FormFile[]>; folder: string; }> {
  const uploadRoot = path.resolve(process.cwd(), "public", "uploads", "properties");
  ensureDir(uploadRoot);
  const folder = id || String(Date.now());
  const targetDir = path.join(uploadRoot, folder);
  ensureDir(targetDir);
  const form = formidable({ multiples: true, uploadDir: targetDir, keepExtensions: true });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      const map: Record<string, FormFile[]> = {};
      for (const [k, v] of Object.entries(files)) map[k] = toArray(v as any) as FormFile[];
      resolve({ fields, files: map, folder });
    });
  });
}
function moveFilesToUrls(files: FormFile[], folder: string): string[] {
  const urls: string[] = [];
  for (const f of files) {
    const p = (f as any).filepath || (f as any).path;
    if (!p) continue;
    const name = path.basename(p);
    urls.push(`/uploads/properties/${folder}/${name}`);
  }
  return urls;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = String(req.query.id || "");
  if (!id) return res.status(400).json({ error: "Missing id" });

  if (req.method === "GET") {
    const item = getById(id);
    if (!item) return res.status(404).json({ error: "Not Found" });
    
    // تنظيف البيانات القديمة التي تأتي كـ arrays
    const cleaned: any = {};
    for (const [key, value] of Object.entries(item)) {
      if (Array.isArray(value) && value.length === 1) {
        // إذا كان array يحتوي على عنصر واحد، استخرجه
        cleaned[key] = value[0];
      } else {
        cleaned[key] = value;
      }
    }
    
    // إصلاح مشكلة الترميز للنصوص العربية
    if (cleaned.title && typeof cleaned.title === 'object') {
      if (cleaned.title.ar && typeof cleaned.title.ar === 'string') {
        try {
          cleaned.titleAr = cleaned.title.ar;
        } catch (e) {
          cleaned.titleAr = cleaned.title.ar;
        }
      }
      if (cleaned.title.en && typeof cleaned.title.en === 'string') {
        try {
          cleaned.titleEn = cleaned.title.en;
        } catch (e) {
          cleaned.titleEn = cleaned.title.en;
        }
      }
    }
    
    if (cleaned.description && typeof cleaned.description === 'object') {
      if (cleaned.description.ar && typeof cleaned.description.ar === 'string') {
        try {
          cleaned.descriptionAr = cleaned.description.ar;
        } catch (e) {
          cleaned.descriptionAr = cleaned.description.ar;
        }
      }
      if (cleaned.description.en && typeof cleaned.description.en === 'string') {
        try {
          cleaned.descriptionEn = cleaned.description.en;
        } catch (e) {
          cleaned.descriptionEn = cleaned.description.en;
        }
      }
    }
    
    // إضافة headers للترميز الصحيح
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).json(cleaned);
  }

  if (req.method === "PUT") {
    try {
      const existing = getById(id) || { id };
      const ctype = String(req.headers["content-type"] || "");
      let body: any = {};
      let images: string[] = Array.isArray((existing as any).images) ? [...(existing as any).images] : [];

      if (ctype.includes("multipart/form-data")) {
        const { fields, files, folder } = await parseMultipart(req, id);
        for (const k of Object.keys(fields)) (fields as any)[k] = parseMaybeJSON((fields as any)[k]);
        body = fields;
        const buckets = ["file", "files", "images", "photos", "media"].flatMap((k) => toArray(files[k]).filter(Boolean));
        images.push(...moveFilesToUrls(buckets, folder));
        const uploadDir = path.resolve(process.cwd(), "public", "uploads", "properties", folder);
        ensureDir(uploadDir);
        const dataUrlRaw = ([] as any[]).concat(toArray((fields as any).images), toArray((fields as any).dataUrls)).flat().filter(Boolean);
        dataUrlRaw.forEach((v, i) => { if (typeof v === "string" && isDataUrl(v)) { const u = saveDataUrl(v, uploadDir, i); if (u) images.push(u); } });
      } else if (ctype.includes("application/json") || !ctype) {
        body = await readJSON(req);
        const upRoot = path.resolve(process.cwd(), "public", "uploads", "properties");
        ensureDir(upRoot);
        const uploadDir = path.join(upRoot, id);
        ensureDir(uploadDir);
        const maybeImgs = toArray(body.images);
        let idx = 0;
        for (const v of maybeImgs) {
          if (typeof v === "string") {
            if (isDataUrl(v)) images.push(saveDataUrl(v, uploadDir, idx++));
            else if (!images.includes(v)) images.push(v);
          }
        }
      } else {
        return res.status(415).json({ error: "Unsupported Media Type" });
      }

      body = normalizeUsage(body || {});
      body = sanitizeDeep(body);
      const updated = upsert({
        ...(existing as any),
        ...(body as any),
        id,
        images: images.filter(Boolean),
        updatedAt: new Date().toISOString(),
      });

      return res.status(200).json({ item: sanitizeDeep(updated) });
    } catch (e: any) {
      return res.status(400).json({ error: e?.message || "Bad Request" });
    }
  }

  res.setHeader("Allow", "GET,PUT");
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}