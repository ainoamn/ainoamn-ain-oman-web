import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { getTask, patchTask, Task, appendThread, addParticipant, addAttachment, getAttachmentPath, removeAttachment, upsertTask } from "../../../../server/db";

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const t = getTask(params.id);
  if (!t) return new NextResponse("Not found", { status: 404 });
  const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8" /><title>طباعة المهمة ${t.title}</title><meta name="viewport" content="width=device-width, initial-scale=1" /><style>body{font-family:Arial,system-ui,-apple-system,Segoe UI,Tahoma;margin:24px}.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.muted{color:#666;font-size:12px}.thread{margin-top:16px}.thread-item{border:1px solid #ddd;border-radius:8px;padding:8px;margin-bottom:8px}.att{margin-top:12px}.att a{color:#0a58ca;text-decoration:none}@media print{.noprint{display:none}}</style></head><body><div class="header"><h1>تفاصيل المهمة</h1><button class="noprint" onclick="window.print()">طباعة</button></div><div><div><b>المعرّف:</b> ${t.id}</div><div><b>العنوان:</b> ${escapeHtml(t.title||"")}</div><div><b>الوصف:</b><br/> ${escapeHtml(t.description||"—")}</div><div><b>الأولوية:</b> ${t.priority}</div><div><b>الحالة:</b> ${t.status}</div><div><b>الاستحقاق:</b> ${t.dueDate||"—"}</div><div class="muted">آخر تحديث: ${t.updatedAt}</div></div><div class="att"><h3>المرفقات</h3>${(t.attachments||[]).map(a=>`<div>• <a href="/api/tasks/${t.id}/file/${a.id}" target="_blank" rel="noreferrer">${escapeHtml(a.name)}</a> (${a.size||0} بايت)</div>`).join("") || "—"}</div><div class="thread"><h3>المحادثة</h3>${t.thread.map(x=>`<div class="thread-item"><div class="muted">${x.author} • ${x.at}</div><div>${escapeHtml(x.text)}</div></div>`).join("")}</div></body></html>`;
  return new NextResponse(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
