import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { getTask, patchTask, Task, appendThread, addParticipant, addAttachment, getAttachmentPath, removeAttachment, upsertTask } from "../../../../server/db";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(()=>({}));
  const { name, email, whatsapp } = body || {};
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const t = addParticipant(params.id, { name: String(name), email: email ? String(email) : undefined, whatsapp: whatsapp ? String(whatsapp) : undefined });
  const contact = [email && `Email: ${email}`, whatsapp && `WhatsApp: ${whatsapp}`].filter(Boolean).join(" | ");
  appendThread(params.id, "system", `تمت دعوة ${name}${contact ? " ("+contact+")" : ""} إلى المهمة.`);
  return NextResponse.json({ ok: true, task: t });
}
