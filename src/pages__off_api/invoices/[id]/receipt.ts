// src/pages/api/invoices/[id]/receipt.ts
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";
import { readJson } from "@/server/fsdb";
import type { Invoice } from "@/server/workflow";
import { generateReceiptPDF } from "@/server/pdf";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = String(req.query.id || "");
  const invoices = await readJson<Invoice[]>("invoices", []);
  const inv = invoices.find(x => x.id === id || x.serial === id);
  if (!inv) return res.status(404).json({ ok: false, error: "NOT_FOUND" });

  const fileRel = `invoice-${inv.serial.replace(/[^\w\-]/g, "_")}.pdf`;
  const fileAbs = path.join(process.cwd(), ".data", "receipts", fileRel);
  if (!fs.existsSync(fileAbs)) {
    // لو مش مولّد، يولّده الآن (فقط لو مدفوع)
    if (inv.status !== "paid") {
      return res.status(400).json({ ok: false, error: "NOT_PAID" });
    }
    await generateReceiptPDF({
      serial: inv.serial,
      invoiceId: inv.id,
      amount: inv.amount,
      currency: inv.currency,
      status: "paid",
      issuedAt: inv.issuedAt,
      paidAt: inv.paidAt,
      items: inv.items,
    });
  }

  const stat = fs.statSync(fileAbs);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Length", stat.size.toString());
  fs.createReadStream(fileAbs).pipe(res);
}
