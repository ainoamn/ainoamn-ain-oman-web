// src/server/pdf.ts
import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Task } from "@/server/tasks";

// ——— إيصال الفاتورة (موجود سابقًا) ———
export type PdfInfo = {
  filename: string;
  absPath: string;
  apiUrl: string;
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

  page.drawRectangle({ x: 40, y: height - 120, width: width - 80, height: 80, color: rgb(0.94, 0.97, 1) });
  page.drawText("Receipt (إيصال)", { x: 55, y: height - 70, size: 22, font, color: rgb(0.2,0.2,0.2) });
  page.drawText(`Invoice: ${opts.serial}  |  Status: ${opts.status}`, { x: 55, y: height - 95, size: 11, font });
  page.drawText(
    `Issued: ${new Date(opts.issuedAt).toLocaleString()}${opts.paidAt ? `  |  Paid: ${new Date(opts.paidAt).toLocaleString()}` : ""}`,
    { x: 55, y: height - 110, size: 10, font }
  );

  let y = height - 150;
  page.drawText("Items:", { x: 55, y, size: 12, font }); y -= 18;
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

// ——— PDF للمهمة مع المرفقات (الصور) ———
export async function generateTaskPDF(task: Task) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const { width, height } = page.getSize();

  page.drawText(`Task ${task.serial}`, { x: 40, y: height - 50, size: 18, font });
  page.drawText(task.title, { x: 40, y: height - 70, size: 12, font });
  if (task.description) page.drawText(task.description.slice(0, 300), { x: 40, y: height - 90, size: 10, font });

  let y = height - 120;
  page.drawText(`Status: ${task.status} | Priority: ${task.priority}`, { x: 40, y, size: 10, font }); y -= 14;
  if (task.dueDate) { page.drawText(`Due: ${new Date(task.dueDate).toLocaleString()}`, { x: 40, y, size: 10, font }); y -= 14; }
  if ((task.labels||[]).length) { page.drawText(`Labels: ${(task.labels||[]).join(", ")}`, { x: 40, y, size: 10, font }); y -= 14; }
  if (task.category) { page.drawText(`Category: ${task.category}`, { x: 40, y, size: 10, font }); y -= 14; }
  if ((task.links||[]).length) {
    page.drawText(`Links: ${(task.links||[]).map(l=>`${l.type}:${l.refId}`).join(" | ")}`, { x: 40, y, size: 10, font }); y -= 14;
  }

  // محادثة موجزة
  if ((task.thread||[]).length) {
    page.drawText("Thread:", { x: 40, y, size: 12, font }); y -= 14;
    for (const m of (task.thread||[]).slice(0, 8)) {
      const line = `${m.no}) ${m.text}`.slice(0, 100);
      page.drawText(line, { x: 50, y, size: 10, font }); y -= 12;
      if (y < 120) { y = height - 60; doc.addPage([595.28, 841.89]); }
    }
  }

  // إدراج صور المرفقات (png/jpg فقط)
  for (const att of task.attachments || []) {
    const p = att.url.startsWith("/") ? path.join(process.cwd(), att.url) : path.join(process.cwd(), att.url.replace(/^\.\//,""));
    if (!fs.existsSync(p)) continue;
    const buff = fs.readFileSync(p);
    let img: any = null;
    if (att.mime.includes("png")) img = await doc.embedPng(buff);
    else if (att.mime.includes("jpg") || att.mime.includes("jpeg")) img = await doc.embedJpg(buff);
    if (!img) continue;
    const dims = img.scale(400 / img.width);
    const pg = doc.addPage([595.28, 841.89]);
    pg.drawText(`Attachment: ${att.name}`, { x: 40, y: 800, size: 10, font });
    pg.drawImage(img, { x: 40, y: 360, width: dims.width, height: dims.height });
  }

  const pdfBytes = await doc.save();
  const dir = path.join(process.cwd(), ".data", "task-pdf");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filename = `task-${task.serial.replace(/[^\w\-]/g, "_")}.pdf`;
  const absPath = path.join(dir, filename);
  fs.writeFileSync(absPath, pdfBytes);
  const apiUrl = `/api/tasks/${encodeURIComponent(task.serial)}/print`;
  return { filename, absPath, apiUrl };
}
