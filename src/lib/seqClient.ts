// src/lib/seqClient.ts
/**
 * Client-safe helper to request a new serial from the API route.
 * Usage in client pages/components:
 *   const serial = await getNextSerial("AO-T");
 */
export async function getNextSerial(prefix: string): Promise<string> {
  const res = await fetch(`/api/seq/next?ns=${encodeURIComponent(prefix)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`getNextSerial failed: ${res.status}`);
  }
  const data = (await res.json()) as { serial: string };
  return data.serial;
}

/**
 * Server-side helper for getServerSideProps or API calls.
 * Provide an absolute base URL (e.g., http://localhost:3000 in dev).
 */
export async function getNextSerialSSR(prefix: string, baseUrl: string): Promise<string> {
  const url = `${baseUrl.replace(/\/$/, "")}/api/seq/next?ns=${encodeURIComponent(prefix)}`;
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" } });
  if (!res.ok) {
    throw new Error(`getNextSerialSSR failed: ${res.status}`);
  }
  const data = (await res.json()) as { serial: string };
  return data.serial;
}

export type EntityKey = "PROPERTY" | "AUCTION" | "CONTRACT" | "INVOICE" | "PAYMENT" | "TASK" | "TICKET";

export async function issueSerial(entity: EntityKey, opts?: { year?: number; width?: number; prefixOverride?: string; resetPolicy?: 'yearly' | 'never' }) {
  const ns = opts?.prefixOverride || entity;
  const serial = await getNextSerial(ns + (opts?.year ? `-${opts.year}` : ""));
  return { ok: true, serial, year: opts?.year ?? new Date().getFullYear(), counter: 1 };
}
