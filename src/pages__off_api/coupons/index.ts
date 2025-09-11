import type { NextApiRequest, NextApiResponse } from "next";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

const DATA = path.join(process.cwd(), ".data");
const FILE = path.join(DATA, "coupons.json");

type CouponType = "percent" | "amount" | "renewal_percent" | "renewal_amount" | "trial_days";
type Coupon = {
  code: string;
  type: CouponType;
  value: number;
  appliesToPlans?: string[];        // دعم سابق
  appliesToAdProducts?: string[];   // جديد
  expiresAt?: number | null;
  maxRedemptions?: number | null;
  redeemed?: number;
  metadata?: Record<string, any>;
  createdAt: number;
};

async function ensure() {
  try { await access(DATA); } catch { await mkdir(DATA, { recursive: true }); }
  try { await access(FILE); } catch { await writeFile(FILE, JSON.stringify({ items: [] }, null, 2), "utf8"); }
}
async function readDB(): Promise<{ items: Coupon[] }> {
  const raw = await readFile(FILE, "utf8").catch(()=> '{"items":[]}');
  try { return JSON.parse(raw || '{"items":[]}'); } catch { return { items: [] }; }
}
async function writeDB(d: { items: Coupon[] }) { await writeFile(FILE, JSON.stringify(d, null, 2), "utf8"); }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await ensure();

  if (req.method === "GET") {
    const { q } = req.query as { q?: string };
    let { items } = await readDB();
    if (q && q.trim()) {
      const n = q.toLowerCase();
      items = items.filter(c => c.code.toLowerCase().includes(n));
    }
    items = items.sort((a,b)=>b.createdAt - a.createdAt);
    return res.status(200).json({ items });
  }

  if (req.method === "POST") {
    const b = req.body as Partial<Coupon>;
    if (!b.code || !b.type || typeof b.value !== "number") return res.status(400).json({ error: "code, type, value required" });
    const db = await readDB();
    if (db.items.some(c => c.code.toLowerCase() === String(b.code).toLowerCase())) return res.status(409).json({ error: "code exists" });
    const item: Coupon = {
      code: String(b.code).toUpperCase(),
      type: b.type as CouponType,
      value: b.value,
      appliesToPlans: Array.isArray(b.appliesToPlans) ? b.appliesToPlans : undefined,
      appliesToAdProducts: Array.isArray(b.appliesToAdProducts) ? b.appliesToAdProducts : undefined,
      expiresAt: typeof b.expiresAt === "number" ? b.expiresAt : null,
      maxRedemptions: typeof b.maxRedemptions === "number" ? b.maxRedemptions : null,
      redeemed: 0,
      metadata: b.metadata && typeof b.metadata === "object" ? b.metadata : undefined,
      createdAt: Date.now(),
    };
    db.items = [item, ...db.items];
    await writeDB(db);
    return res.status(201).json({ ok: true, item });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method Not Allowed" });
}
