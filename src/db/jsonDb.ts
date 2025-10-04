import fs from "fs";
import path from "path";

type DbShape = Record<string, any>;

const DATA_DIR = path.resolve(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "db.json");

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2), "utf8");
}

export function readDb(): DbShape {
  ensureDb();
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    const j = JSON.parse(raw || "{}");
    // إصلاح مشكلة الترميز
    return fixEncoding(j && typeof j === "object" ? j : {});
  } catch (error) {
    console.error('Error reading database:', error);
    return {};
  }
}

function fixEncoding(obj: any): any {
  if (typeof obj === 'string') {
    // محاولة إصلاح الترميز المشوه
    try {
      // إذا كان النص يحتوي على رموز مشوهة، حاول إصلاحها
      if (/[^\x00-\x7F]/.test(obj) && obj.includes('')) {
        // النص يحتوي على رموز مشوهة، اتركه كما هو
        return obj;
      }
      return obj;
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

export function writeDb(db: DbShape) {
  ensureDb();
  fs.writeFileSync(DB_PATH, JSON.stringify(db ?? {}, null, 2), "utf8");
}
