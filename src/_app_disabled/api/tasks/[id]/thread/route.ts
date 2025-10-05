import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { getTask, patchTask, Task, appendThread, addParticipant, addAttachment, getAttachmentPath, removeAttachment, upsertTask } from "../../../../server/db";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(()=>({}));
  const { author, text } = body || {};
  if (!text || !String(text).trim()) return NextResponse.json({ error: "Text is required" }, { status: 400 });
  const who = author ? String(author) : "admin";
  const t = appendThread(params.id, who, String(text).trim());
  return NextResponse.json({ ok: true, task: t });
}
