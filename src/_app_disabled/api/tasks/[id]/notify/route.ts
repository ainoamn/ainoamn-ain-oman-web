import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { getTask, patchTask, Task, appendThread, addParticipant, addAttachment, getAttachmentPath, removeAttachment, upsertTask } from "../../../../server/db";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(()=>({}));
  const { channel, to, text } = body || {};
  if (!to || !text) return NextResponse.json({ error: "to & text are required" }, { status: 400 });
  const sent = `إشعار مرسل عبر ${channel || "unknown"} إلى ${to}::\n${text}`;
  appendThread(params.id, "system", sent);
  return NextResponse.json({ ok: true });
}
