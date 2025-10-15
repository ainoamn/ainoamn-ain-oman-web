// root: src/pages/api/properties/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";
import formidable, { File as FormFile } from "formidable";
import { getAll, upsert, type Property } from "@/server/properties/store";
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
async function parseMultipart(req: NextApiRequest): Promise<{ fields: any; files: Record<string, FormFile[]>; }> {
  const uploadRoot = path.resolve(process.cwd(), "public", "uploads", "properties");
  ensureDir(uploadRoot);
  const folder = String(Date.now());
  const targetDir = path.join(uploadRoot, folder);
  ensureDir(targetDir);
  const form = formidable({ multiples: true, uploadDir: targetDir, keepExtensions: true });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      const map: Record<string, FormFile[]> = {};
      for (const [k, v] of Object.entries(files)) map[k] = toArray(v as any) as FormFile[];
      (fields as any).__folder = folder;
      resolve({ fields, files: map });
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
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  // منع أي كاش للـ API لضمان ظهور التحديثات فورًا
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

  if (req.method === "GET") {
    const items = getAll();
    // تنظيف البيانات القديمة التي تأتي كـ arrays وإصلاح مسارات الصور
    const cleanedItems = items.map(item => {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(item)) {
        if (Array.isArray(value) && value.length === 1) {
          // إذا كان array يحتوي على عنصر واحد، استخرجه
          cleaned[key] = value[0];
        } else {
          cleaned[key] = value;
        }
      }
      
      // إصلاح مسارات الصور
      if (cleaned.images && Array.isArray(cleaned.images)) {
        cleaned.images = cleaned.images.map((img: string) => {
          if (img && !img.startsWith('/uploads/') && !img.startsWith('http') && !img.startsWith('data:')) {
            // إذا كان اسم ملف فقط، أضف المسار الكامل
            return `/uploads/properties/${cleaned.id}/${img}`;
          }
          return img;
        });
      } else if (cleaned.images && typeof cleaned.images === 'string') {
        // إذا كانت الصور كسلسلة نصية واحدة
        if (cleaned.images && !cleaned.images.startsWith('/uploads/') && !cleaned.images.startsWith('http') && !cleaned.images.startsWith('data:')) {
          cleaned.images = `/uploads/properties/${cleaned.id}/${cleaned.images}`;
        }
      }
      
      // إصلاح صورة الغلاف
      if (cleaned.coverImage && !cleaned.coverImage.startsWith('/uploads/') && !cleaned.coverImage.startsWith('http') && !cleaned.coverImage.startsWith('data:')) {
        cleaned.coverImage = `/uploads/properties/${cleaned.id}/${cleaned.coverImage}`;
      }
      
      return cleaned;
    });
    return res.status(200).json({ items: cleanedItems });
  }

  if (req.method === "POST") {
    try {
      const ctype = String(req.headers["content-type"] || "");
      let body: any = {};
      let images: string[] = [];
      let folder = String(Date.now());

      if (ctype.includes("multipart/form-data")) {
        const { fields, files } = await parseMultipart(req);
        folder = (fields as any).__folder || folder;
        for (const k of Object.keys(fields)) {
          const value = (fields as any)[k];
          if (Array.isArray(value) && value.length === 1) {
            (fields as any)[k] = parseMaybeJSON(value[0]);
          } else {
            (fields as any)[k] = parseMaybeJSON(value);
          }
        }
        body = fields;
        const fileBuckets = ["file", "files", "images", "photos", "media"]
          .flatMap((k) => toArray(files[k]).filter(Boolean));
        images.push(...moveFilesToUrls(fileBuckets, folder));
        const uploadDir = path.resolve(process.cwd(), "public", "uploads", "properties", folder);
        ensureDir(uploadDir);
        const dataUrlRaw = ([] as any[]).concat(
          toArray((fields as any).images),
          toArray((fields as any).dataUrls),
        ).flat().filter(Boolean);
        dataUrlRaw.forEach((v, i) => {
          if (typeof v === "string" && isDataUrl(v)) {
            const u = saveDataUrl(v, uploadDir, i);
            if (u) images.push(u);
          }
        });
      } else if (ctype.includes("application/json") || !ctype) {
        body = await readJSON(req);
        const upRoot = path.resolve(process.cwd(), "public", "uploads", "properties");
        ensureDir(upRoot);
        const uploadDir = path.join(upRoot, folder);
        ensureDir(uploadDir);
        const maybeImgs = toArray(body.images);
        let idx = 0;
        for (const v of maybeImgs) {
          if (typeof v === "string") {
            if (isDataUrl(v)) images.push(saveDataUrl(v, uploadDir, idx++));
            else images.push(v);
          }
        }
      } else {
        return res.status(415).json({ error: "Unsupported Media Type" });
      }

      body = normalizeUsage(body || {});
      body = sanitizeDeep(body);
      const now = new Date().toISOString();
      const id = body.id?.toString() || "P-" + now.replace(/[-:.TZ]/g, "").slice(0, 14);

      const item: Property = {
        id,
        referenceNo: body.referenceNo || "",
        title: body.title || { ar: "", en: "" },
        priceOMR: Number(body.priceOMR ?? 0),
        province: body.province || "",
        state: body.state || "",
        village: body.village || "",
        purpose: body.purpose || "rent",
        type: body.type || "apartment",
        status: body.status || "vacant",
        createdAt: now,
        updatedAt: now,
        ...body,
        images: Array.isArray(images) && images.length ? images : (Array.isArray(body.images) ? body.images : []),
      };

      upsert(item);
      return res.status(201).json({ id: item.id, item: sanitizeDeep(item) });
    } catch (e: any) {
      return res.status(400).json({ error: e?.message || "Bad Request" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}