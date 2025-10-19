// @ts-nocheck
// src/pages/api/payments/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fsdb from "@/server/fsdb";

function genId(prefix = '') {
  const n = Date.now().toString(36).toUpperCase();
  return prefix ? `${prefix}-${n}` : n;
}

type Payment = { id: string; bookingId: string; amount: number; method?: string; paidAt: string; meta?: any };

const FILE = "payments.json";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const items = readJson<Payment[]>(FILE, []);
    return res.status(200).json(items);
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const p: Payment = {
      id: genId("PAY"),
      bookingId: String(body.bookingId),
      amount: Number(body.amount || 0),
      method: body.method || "card",
      paidAt: new Date().toISOString(),
      meta: body.meta || {},
    };
    const items = await fsdb.readJson<Payment[]>(FILE, []);
    items.push(p);
    await fsdb.writeJson(FILE, items);
    return res.status(201).json(p);
  }

  return res.status(405).end();
}
