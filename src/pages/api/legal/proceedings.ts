// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from "next";
import { Assignments, Stages, Cases, uid, now, Audit } from "../../../server/legal/store";
import { can } from "../../../lib/rbac";
import { contextFrom } from "../../../lib/user-context";
import type { CaseStage, CaseStageHistory, AssignmentRole } from "../../../server/legal/types";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = contextFrom(req);
  const caseId = (req.query.caseId as string) || (req.body?.caseId as string);
  if (!caseId) return res.status(400).json({ error: "caseId required" });

  if (req.method === "GET") {
    return res.status(200).json({ assignments: Assignments.history(ctx.tenantId, caseId), stages: Stages.history(ctx.tenantId, caseId) });
  }

  if (req.method === "POST") {
    if (!can(ctx.roles, "case:write")) return res.status(403).json({ error: "forbidden" });
    const kind = String(req.body?.kind||"");

    if (kind==="assignMany") {
      const items: { toLawyerId: string; role: AssignmentRole }[] = Array.isArray(req.body?.items)?req.body.items:[];
      if (!Cases.get(ctx.tenantId, caseId)) Cases.upsertById({ id: caseId, tenantId: ctx.tenantId }); // تأكد من وجود القضية
      const list = items.filter(it=>it.toLawyerId).map(it=>({ id: uid(), tenantId: ctx.tenantId, caseId, toLawyerId: it.toLawyerId, role: it.role, at: now() }));
      Assignments.addMany(list); Audit.add({ id: uid(), tenantId: ctx.tenantId, actorId: ctx.userId, action: "assignMany", entity: "case", entityId: caseId, at: now(), meta: { count: list.length } });
      return res.status(201).json(list);
    }

    if (kind==="stage" || kind==="stageAdd") {
      let c = Cases.get(ctx.tenantId, caseId);
      if (!c) c = Cases.upsertById({ id: caseId, tenantId: ctx.tenantId }); // إنشاء تلقائي
      const to = kind==="stage" ? String(req.body?.to as CaseStage) : c.stage;
      const at = req.body?.at ? new Date(req.body.at).toISOString() : now();
      const h: CaseStageHistory = { id: uid(), tenantId: ctx.tenantId, caseId, from: kind==="stage" ? c.stage : undefined, to: to as CaseStage, at, note: req.body?.note, by: ctx.userId };
      if (kind==="stage") { c.stage = to as CaseStage; c.updatedAt = now(); Cases.upsertById(c); }
      Stages.add(h);
      Audit.add({ id: uid(), tenantId: ctx.tenantId, actorId: ctx.userId, action: kind, entity: "case", entityId: caseId, at: now(), meta: { to } });
      return res.status(201).json(h);
    }

    if (kind==="stageUpdate") {
      const id = String(req.body?.id||""); const at = req.body?.at ? new Date(req.body.at).toISOString():undefined; const note = req.body?.note as string|undefined;
      const updated = Stages.update(id, { at, note, by: ctx.userId }); if (!updated) return res.status(404).json({ error: "history_not_found" });
      Audit.add({ id: uid(), tenantId: ctx.tenantId, actorId: ctx.userId, action: "stageUpdate", entity: "case", entityId: caseId, at: now(), meta: { historyId: id } });
      return res.status(200).json(updated);
    }

    if (kind==="stageVoid") {
      const id = String(req.body?.id||""); const reason = String(req.body?.reason||"voided");
      const updated = Stages.void(id, reason); if (!updated) return res.status(404).json({ error: "history_not_found" });
      Audit.add({ id: uid(), tenantId: ctx.tenantId, actorId: ctx.userId, action: "stageVoid", entity: "case", entityId: caseId, at: now(), meta: { historyId: id, reason } });
      return res.status(200).json(updated);
    }

    return res.status(400).json({ error: "invalid kind" });
  }

  res.setHeader("Allow","GET,POST"); return res.status(405).end();
}
