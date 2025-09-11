// src/pages/api/property/[id]/availability.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { readJson } from "@/server/fsdb";

type Reservation = {
  id: string;
  propertyId: string;
  unitId?: string;
  startDate: string; // ISO yyyy-mm-dd
  periodMonths?: number;
  periodDays?: number;
};

function parseISO(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(+d)) return null;
  d.setHours(0,0,0,0);
  return d;
}

function addMonths(d: Date, months: number) {
  const dt = new Date(d);
  dt.setMonth(dt.getMonth() + months);
  return dt;
}

function addDays(d: Date, days: number) {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + days);
  return dt;
}

function endDate(start: Date, months?: number, days?: number) {
  if (months && months > 0) {
    const ed = addMonths(start, months);
    ed.setDate(ed.getDate() - 1);
    return ed;
  }
  if (days && days > 0) {
    const ed = addDays(start, days - 1);
    return ed;
  }
  return start;
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart <= bEnd && bStart <= aEnd;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const propertyId = String(req.query.id || "");
  const unitId = req.query.unitId ? String(req.query.unitId) : undefined;
  const startDateStr = String(req.query.start || "");
  const periodMonths = req.query.periodMonths ? +req.query.periodMonths : undefined;
  const periodDays = req.query.periodDays ? +req.query.periodDays : undefined;

  const s = parseISO(startDateStr);
  if (!s) return res.status(400).json({ ok: false, error: "BAD_DATE" });
  const e = endDate(s, periodMonths, periodDays);

  try {
    const list = await readJson<Reservation[]>("reservations", []);
    const same = list.filter(x => String(x.propertyId) === propertyId && (unitId ? String(x.unitId) === unitId : true));

    const conflicts = same.filter((r) => {
      const rs = parseISO(r.startDate)!;
      const re = endDate(rs, r.periodMonths, r.periodDays);
      return overlaps(s, e, rs, re);
    });

    const available = conflicts.length === 0;
    return res.status(200).json({ ok: true, available, conflicts });
  } catch (err) {
    console.error("availability error:", err);
    return res.status(500).json({ ok: false, error: "Internal Server Error" });
  }
}
