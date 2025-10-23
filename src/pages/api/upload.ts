// src/pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingMessage } from "http";

// ======== مخزن بسيط في الذاكرة =========
type Upload = { mime: string; buf: Buffer };
type Store = { files: Record<string, Upload> };
// @ts-ignore
global.__AIN_UPLOADS__ = (global.__AIN_UPLOADS__ || { files: {} }) as Store;
const store: Store = global.__AIN_UPLOADS__;

// ========= إعدادات البودي =============
// نحتاج تعطيل البارسر الافتراضي كي ندعم multipart يدويًا.
// وسندعم application/json يدويًا أيضًا.
export const config = {
  api: {
    bodyParser: false,
  },
};

// ========= أدوات مساعدة ===============
function ok(res: NextApiResponse, payload: any) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json(payload);
}
function bad(res: NextApiResponse, msg = "bad-request") {
  return res.status(400).json({ ok: false, error: msg });
}
function serverErr(res: NextApiResponse, msg = "upload-failed") {
  return res.status(500).json({ ok: false, error: msg });
}
function uid(prefix = "file") {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e5)}`;
}
function publicUrlFor(name: string) {
  // نستخدم نفس المسار القديم: /api/upload?name=...
  return `/api/upload?name=${encodeURIComponent(name)}`;
}

async function readRawBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return await new Promise<Buffer>((resolve, reject) => {
    req.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

// =========== قارئ JSON Base64 =============
async function tryHandleJson(req: NextApiRequest) {
  const raw = await readRawBody(req);
  const txt = raw.toString("utf8").trim();
  if (!txt) return null;
  let parsed: any;
  try {
    parsed = JSON.parse(txt);
  } catch {
    return null; // ليس JSON صحيح
  }
  const files = Array.isArray(parsed?.files) ? parsed.files : [];
  if (!files.length) return { names: [] as string[] };

  const names: string[] = [];
  for (const f of files) {
    const name = String(f?.name || uid("file"));
    const type = String(f?.type || "application/octet-stream");
    const dataB64 = String(f?.data || "");
    if (!dataB64) continue;
    const buf = Buffer.from(dataB64, "base64");
    store.files[name] = { mime: type, buf };
    names.push(name);
  }
  return { names };
}

// ========== قارئ multipart/form-data ==========
async function tryHandleMultipart(req: NextApiRequest) {
  // سنستخدم busboy إن توافر. نتجنب إضافة تبعية جديدة.
  let Busboy: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Busboy = require("busboy");
  } catch {
    return null; // لا يمكن تحليل multipart دون busboy
  }

  const bb = Busboy({ headers: req.headers });
  const names: string[] = [];
  const tasks: Promise<void>[] = [];

  const done = new Promise<void>((resolve, reject) => {
    bb.on("file", (_name: string, file: NodeJS.ReadableStream, info: any) => {
      const filename: string = info?.filename || uid("file");
      const mime: string = info?.mimeType || info?.mime || "application/octet-stream";
      const chunks: Buffer[] = [];
      file.on("data", (d: Buffer) => chunks.push(d));
      file.on("end", () => {
        const buf = Buffer.concat(chunks);
        store.files[filename] = { mime, buf };
        names.push(filename);
      });
    });
    bb.on("field", (_name: string, _val: string) => {
      // يمكن تجاهل الحقول النصية
    });
    bb.on("error", reject);
    bb.on("finish", resolve);
  });

  req.pipe(bb);
  await done;
  return { names };
}

// =========== معالج GET (جلب ملف) ===========
function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const name = String(req.query.name || "");
  if (!name) return bad(res, "name-required");
  const it = store.files[name];
  if (!it) return res.status(404).end("not found");
  res.setHeader("Content-Type", it.mime || "application/octet-stream");
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).send(it.buf);
}

// =========== معالج HEAD (وجود ملف) =========
function handleHead(req: NextApiRequest, res: NextApiResponse) {
  const name = String(req.query.name || "");
  const it = name ? store.files[name] : null;
  if (!it) return res.status(404).end();
  res.setHeader("Content-Type", it.mime || "application/octet-stream");
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).end();
}

// =========== نقطة الدخول ===============
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") return handleGet(req, res);
    if (req.method === "HEAD") return handleHead(req, res);

    if (req.method !== "POST") {
      res.setHeader("Allow", "GET,HEAD,POST");
      return res.status(405).end();
    }

    const ctype = String(req.headers["content-type"] || "").toLowerCase();

    // 1) JSON Base64
    if (ctype.includes("application/json")) {
      const out = await tryHandleJson(req);
      if (!out) return bad(res, "invalid-json");
      const { names } = out;
      // استجابة متوافقة قديمًا وحديثًا
      return ok(res, {
        ok: true,
        names,
        files: names.map((n) => ({ name: n, url: publicUrlFor(n) })),
      });
    }

    // 2) multipart/form-data
    if (ctype.includes("multipart/form-data")) {
      const out = await tryHandleMultipart(req);
      if (!out) return bad(res, "invalid-multipart");
      const { names } = out;
      return ok(res, {
        ok: true,
        names,
        files: names.map((n) => ({ name: n, url: publicUrlFor(n) })),
      });
    }

    // 3) أي نوع آخر غير مدعوم
    return bad(res, "unsupported-content-type");
  } catch (e) {
    return serverErr(res);
  }
}
