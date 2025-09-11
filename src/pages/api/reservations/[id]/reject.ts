/**
 * API: POST /api/reservations/[id]/reject
 * Location: src/pages/api/reservations/[id]/reject.ts
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { readArray, writeArray } from "@/server/jsonStore";
import type { Reservation } from "@/types/billing";
export const config = { runtime: "nodejs" };

const RES_FILE = "reservations.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed" });
    }
    const id = String(req.query.id || "");
    const list = readArray<Reservation>(RES_FILE);
    const item = list.find((x) => x.id === id);
    if (!item) return res.status(404).json({ error: "Reservation not found" });

    item.status = "rejected";
    item.updatedAt = new Date().toISOString();
    writeArray<Reservation>(RES_FILE, list);

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}
