//src\_app_disabled\api\tasks\[id]\attachments\route.ts
import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { getTask, patchTask, Task, appendThread, addParticipant, addAttachment, getAttachmentPath, removeAttachment, upsertTask } from "../../../../server/db";

export const maxDuration = 60;
export const preferredRegion = "auto";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const t = getTask(params.id);
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ attachments: t.attachments || [] });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(()=>({}));
  const { name, type, size, contentBase64 } = body || {};
  if (!name || !contentBase64) return NextResponse.json({ error: "name & contentBase64 required" }, { status: 400 });
  try {
    const r = addAttachment(params.id, { name: String(name), type: type ? String(type) : undefined, size: size ? Number(size) : undefined, contentBase64: String(contentBase64) });
    return NextResponse.json({ ok: true, attachment: r.attachment, task: r.task });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "upload failed" }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(()=>({}));
  const { attId } = body || {};
  if (!attId) return NextResponse.json({ error: "attId required" }, { status: 400 });
  try {
    const t = removeAttachment(params.id, String(attId));
    return NextResponse.json({ ok: true, task: t });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "delete failed" }, { status: 400 });
  }
}
