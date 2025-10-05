import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { getTask, patchTask, Task, appendThread, addParticipant, addAttachment, getAttachmentPath, removeAttachment, upsertTask } from "../../../../server/db";

export async function POST(req: Request) {
  const body = await req.json().catch(()=>({}));
  const { taskId, start, end } = body || {};
  if (!taskId || typeof taskId !== "string") return NextResponse.json({ error: "taskId required" }, { status: 400 });
  const t = getTask(taskId);
  if (!t) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  t.calendarEvent = { id: `evt_${Date.now()}`, title: t.title || `Task ${t.id}`, start: start || t.dueDate, end: end || t.dueDate, createdAt: new Date().toISOString() };
  upsertTask(t);
  return NextResponse.json({ ok: true, event: t.calendarEvent });
}
