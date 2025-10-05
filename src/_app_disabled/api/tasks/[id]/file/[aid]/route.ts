import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { getTask, patchTask, Task, appendThread, addParticipant, addAttachment, getAttachmentPath, removeAttachment, upsertTask } from "../../../../server/db";

import fs from "fs";
export async function GET(_req: Request, { params }: { params: { id: string, aid: string } }) {
  const info = getAttachmentPath(params.id, params.aid);
  if (!info) return new NextResponse("Not found", { status: 404 });
  const stat = fs.statSync(info.path);
  const buf = fs.readFileSync(info.path);
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Length": String(stat.size),
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(info.name)}`,
      ...(info.type ? { "Content-Type": info.type } : {}),
    }
  });
}
