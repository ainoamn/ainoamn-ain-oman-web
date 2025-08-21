import PDFDocument from "pdfkit";
import { Readable } from "stream";

export type TaskForPdf = {
  id: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  category?: string;
  assignees?: string[];
  labels?: string[];
  createdAt?: string;
  updatedAt?: string;
  thread?: { id: string; author: string; ts: string; text: string }[];
  attachments?: { id: string; name: string; url: string }[];
};

export function taskToPdfStream(task: TaskForPdf): Readable {
  const doc = new PDFDocument({ margin: 50 });
  const stream = doc as unknown as Readable;

  const H = (t: string) => { doc.moveDown(0.4).fontSize(14).fillColor("#111").text(t); };
  const P = (t?: string) => { if (!t) return; doc.moveDown(0.2).fontSize(10).fillColor("#333").text(t); };
  const L = () => doc.moveDown(0.3).strokeColor("#ddd").lineWidth(1).moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width-doc.page.margins.right, doc.y).stroke();

  doc.fontSize(18).fillColor("#0a0a0a").text(`Task ${task.id}: ${task.title}`);
  P(`Status: ${task.status || "-" } • Priority: ${task.priority || "-" } • Category: ${task.category || "-" }`);
  P(`Assignees: ${(task.assignees||[]).join(", ") || "-"}`);
  P(`Labels: ${(task.labels||[]).join(", ") || "-"}`);
  P(`Created: ${task.createdAt || "-"} • Updated: ${task.updatedAt || "-"}`);
  L();

  H("الوصف");
  P(task.description || "-");
  L();

  H("المحادثة");
  if (!task.thread || task.thread.length === 0) P("— لا توجد رسائل —");
  else for (const m of task.thread) P(`[${m.ts}] ${m.author}: ${m.text}`);
  L();

  H("المرفقات");
  if (!task.attachments || task.attachments.length === 0) P("— لا توجد مرفقات —");
  else for (const a of task.attachments) P(`• ${a.name} — ${a.url}`);

  doc.end();
  return stream;
}
