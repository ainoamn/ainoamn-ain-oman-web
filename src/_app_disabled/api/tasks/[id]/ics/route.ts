import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { getTask, patchTask, Task, appendThread, addParticipant, addAttachment, getAttachmentPath, removeAttachment, upsertTask } from "../../../../server/db";

function toICSDate(d: Date) { const pad=(n:number)=>`${n}`.padStart(2,"0"); return `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`; }
function escapeICS(s: string) { return s.replace(/\\/g,"\\\\").replace(/,/g,"\\,").replace(/;/g,"\\;").replace(/\n/g,"\\n"); }
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const t = getTask(params.id);
  if (!t) return new NextResponse("Not found", { status: 404 });
  const dtstamp = toICSDate(new Date());
  const start = t.dueDate ? toICSDate(new Date(t.dueDate)) : dtstamp;
  const end = t.dueDate ? toICSDate(new Date(new Date(t.dueDate).getTime()+60*60*1000)) : dtstamp;
  const ics = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Ain Oman//Tasks//AR","CALSCALE:GREGORIAN","METHOD:PUBLISH","BEGIN:VEVENT",`UID:${params.id}@ain-oman-admin`,`DTSTAMP:${dtstamp}`,`DTSTART:${start}`,`DTEND:${end}`,`SUMMARY:${escapeICS(t.title||"Task")}`,`DESCRIPTION:${escapeICS(t.description||"")}`,"END:VEVENT","END:VCALENDAR"].join("\r\n");
  return new NextResponse(ics, { status: 200, headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `attachment; filename="task-${params.id}.ics"` } });
}
