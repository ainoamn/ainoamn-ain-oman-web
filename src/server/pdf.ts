// src/server/pdf.ts
import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type PdfInfo = {
  filename: string;          // invoice-<serial>.pdf
  absPath: string;           // C:\dev\ain-oman-web\.data\receipts\...
  apiUrl: string;            // /api/invoices/<id or serial>/receipt
};

export async function generateReceiptPDF(opts: {
  serial: string;
  invoiceId: string;
  amount: number;
  currency: string;
  status: string;
  issuedAt: string;
  paidAt?: string;
  items: { title: string; qty: number; price: number; total: number }[];
}) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const { width, height } = page.getSize();

  const title = `Receipt (إيصال)`;
  const sub = `Invoice: ${opts.serial}  |  Status: ${opts.status}`;
  const dateStr = `Issued: ${new Date(opts.issuedAt).toLocaleString()}${opts.paidAt ? `  |  Paid: ${new Date(opts.paidAt).toLocaleString()}` : ""}`;

  page.drawRectangle({ x: 40, y: height - 120, width: width - 80, height: 80, color: rgb(0.94, 0.97, 1) });
  page.drawText(title, { x: 55, y: height - 70, size: 22, font, color: rgb(0.2, 0.2, 0.2) });
  page.drawText(sub, { x: 55, y: height - 95, size: 11, font, color: rgb(0.2, 0.2, 0.5) });
  page.drawText(dateStr, { x: 55, y: height - 110, size: 10, font, color: rgb(0.2, 0.2, 0.5) });

  let y = height - 150;
  page.drawText("Items:", { x: 55, y, size: 12, font });
  y -= 18;
  page.drawText("Title", { x: 55, y, size: 10, font });
  page.drawText("Qty",   { x: 300, y, size: 10, font });
  page.drawText("Price", { x: 360, y, size: 10, font });
  page.drawText("Total", { x: 440, y, size: 10, font });
  y -= 12;
  page.drawLine({ start: { x: 55, y }, end: { x: width - 55, y }, thickness: 0.5, color: rgb(0.5,0.5,0.5) });
  y -= 14;

  opts.items.forEach((it) => {
    page.drawText(String(it.title), { x: 55, y, size: 10, font });
    page.drawText(String(it.qty),   { x: 300, y, size: 10, font });
    page.drawText(String(it.price), { x: 360, y, size: 10, font });
    page.drawText(String(it.total), { x: 440, y, size: 10, font });
    y -= 16;
  });

  y -= 10;
  page.drawLine({ start: { x: 55, y }, end: { x: width - 55, y }, thickness: 0.5, color: rgb(0.5,0.5,0.5) });
  y -= 22;
  page.drawText(`TOTAL: ${opts.amount} ${opts.currency}`, { x: 55, y, size: 14, font, color: rgb(0.1,0.4,0.1) });

  const pdfBytes = await doc.save();

  const dir = path.join(process.cwd(), ".data", "receipts");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filename = `invoice-${opts.serial.replace(/[^\w\-]/g, "_")}.pdf`;
  const absPath = path.join(dir, filename);
  fs.writeFileSync(absPath, pdfBytes);

  const apiUrl = `/api/invoices/${encodeURIComponent(opts.serial)}/receipt`;
  return { filename, absPath, apiUrl } as PdfInfo;
}
