import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { getTask, patchTask, Task, appendThread, addParticipant, addAttachment, getAttachmentPath, removeAttachment, upsertTask } from "../../../../server/db";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const t = getTask(params.id);
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(t);
}
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(()=>({}));
  let updated: Task;
  if ((body as any).patch) updated = patchTask(params.id, (body as any).patch);
  else {
    const incoming = body as Partial<Task>;
    updated = patchTask(params.id, {
      title: incoming.title, description: incoming.description,
      priority: incoming.priority, status: incoming.status,
      dueDate: incoming.dueDate, assignees: incoming.assignees,
      link: (incoming as any).link, participants: incoming.participants, attachments: incoming.attachments
    } as any);
  }
  return NextResponse.json(updated);
}
export const PATCH = PUT;
