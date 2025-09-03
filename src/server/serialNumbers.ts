// src/server/serialNumbers.ts
// Server-only utilities for sequential IDs stored in ./.data/counters.json
// Works with Node 18+ and Next.js (Pages Router).
// Do NOT import this file from client components.

import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), ".data");
const COUNTERS_FILE = path.join(DATA_DIR, "counters.json");

type Counters = Record<string, number>;

async function ensureStore(): Promise<void> {
  try {
    await access(DATA_DIR);
  } catch {
    await mkdir(DATA_DIR, { recursive: true });
  }
  try {
    await access(COUNTERS_FILE);
  } catch {
    await writeFile(COUNTERS_FILE, JSON.stringify({}, null, 2), "utf8");
  }
}

async function readCounters(): Promise<Counters> {
  await ensureStore();
  const txt = await readFile(COUNTERS_FILE, "utf8").catch(() => "{}");
  try {
    return JSON.parse(txt || "{}") as Counters;
  } catch {
    // If file is corrupted, reset to empty to avoid crashes in dev
    return {};
  }
}

async function writeCounters(counters: Counters): Promise<void> {
  await writeFile(COUNTERS_FILE, JSON.stringify(counters, null, 2), "utf8");
}

/**
 * Get next serial like "AO-T-000001".
 * @param prefix e.g. "AO-T" or "AO-P"
 * @param width zero-padding width, default 6
 */
export async function nextSerial(prefix: string, width = 6): Promise<{ serial: string; value: number; }> {
  const counters = await readCounters();
  const current = counters[prefix] ?? 0;
  const next = current + 1;
  counters[prefix] = next;
  await writeCounters(counters);
  const serial = `${prefix}-${String(next).padStart(width, "0")}`;
  return { serial, value: next };
}

/**
 * Peek the next serial without increment.
 */
export async function peekSerial(prefix: string, width = 6): Promise<{ serial: string; value: number; }> {
  const counters = await readCounters();
  const current = counters[prefix] ?? 0;
  const next = current + 1;
  return { serial: `${prefix}-${String(next).padStart(width, "0")}`, value: next };
}
