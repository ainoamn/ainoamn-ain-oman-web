
// src/server/fsdb.ts
// Server-only tiny JSON store for dev/demo.
// DO NOT import this file from client components. Use only in API routes or getServerSideProps/getStaticProps.

import { promises as fs } from "fs";
import path from "path";

const dataDir = process.env.FSDB_DIR || path.join(process.cwd(), "data");

async function ensureDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

function withExt(file: string) {
  return file.endsWith(".json") ? file : `${file}.json`;
}

export async function readJson<T = unknown>(file: string, fallback?: T): Promise<T> {
  await ensureDir();
  const p = path.join(dataDir, withExt(file));
  try {
    const raw = await fs.readFile(p, "utf8");
    return JSON.parse(raw) as T;
  } catch (err: any) {
    if (err?.code === "ENOENT") {
      if (typeof fallback !== "undefined") return fallback as T;
      throw new Error(`fsdb: file not found ${p}`);
    }
    throw err;
  }
}

export async function writeJson<T = unknown>(file: string, data: T): Promise<void> {
  await ensureDir();
  const p = path.join(dataDir, withExt(file));
  const tmp = p + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, p);
}

export function dataPath(file?: string): string {
  return file ? path.join(dataDir, withExt(file)) : dataDir;
}

export default { readJson, writeJson, dataPath };
