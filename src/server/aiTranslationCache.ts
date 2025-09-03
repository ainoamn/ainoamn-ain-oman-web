// src/server/aiTranslationCache.ts
import fs from "fs";
import path from "path";
import crypto from "crypto";

const baseDir = path.join(process.cwd(), ".data", "ai-i18n");
const filePath = path.join(baseDir, "cache.json");

type CacheMap = Record<string, string>;

function ensureFile() {
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "{}", "utf-8");
}

function load(): CacheMap {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8") || "{}");
  } catch {
    return {};
  }
}

function save(map: CacheMap) {
  ensureFile();
  fs.writeFileSync(filePath, JSON.stringify(map, null, 2), "utf-8");
}

export function makeKey(text: string, targetLang: string) {
  const h = crypto.createHash("sha1").update(`${targetLang}::${text}`).digest("hex");
  return `${targetLang}:${h}`;
}

export function getCached(text: string, targetLang: string) {
  const key = makeKey(text, targetLang);
  const map = load();
  return map[key];
}

export function setCached(text: string, targetLang: string, translated: string) {
  const key = makeKey(text, targetLang);
  const map = load();
  map[key] = translated;
  save(map);
}
