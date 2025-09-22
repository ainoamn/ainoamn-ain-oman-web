import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const p = body?.project || {};
    const units = Array.isArray(p.units) ? p.units : [];
    const totalSales = units
      .filter((u: any) => (u.for ?? "sale") !== "rent")
      .reduce((sum: number, u: any) => sum + (Number(u.priceBase) || 0), 0);

    const areaSum = units.reduce((s: number, u: any) => s + (Number(u.area) || 0), 0);
    const avgPricePerSqm = areaSum > 0 ? totalSales / areaSum : undefined;

    const capex = Number(p.finance?.capex) || 0;
    const opexMonthly = Number(p.finance?.opexMonthly) || 0;

    const gross = totalSales - capex;
    const grossMarginPct = totalSales > 0 ? (gross / totalSales) * 100 : undefined;
    const paybackYears = opexMonthly > 0 ? Math.max(0, capex / (opexMonthly * 12)) : undefined;

    const estimate = {
      totals: {
        units: units.length,
        available: units.filter((u: any) => u.status === "available").length,
        reserved: units.filter((u: any) => u.status === "reserved").length,
        sold: units.filter((u: any) => u.status === "sold").length,
        forSale: units.filter((u: any) => (u.for ?? "sale") !== "rent").length,
        forRent: units.filter((u: any) => (u.for ?? "sale") !== "sale").length
      },
      revenue: { expectedSales: totalSales, avgPricePerSqm },
      cost: { capex, opexMonthly },
      profit: { gross, grossMarginPct, paybackYears },
      cashflow: { monthlyNet: Math.max(0, (totalSales / 24) - opexMonthly) } // تقدير بسيط
    };

    return res.status(200).json({ ok: true, estimate });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: "server_error", message: e?.message });
  }
}
