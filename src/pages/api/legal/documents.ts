import type { NextApiRequest, NextApiResponse } from "next";
import { Documents, uid, now, Audit, Cases } from "../../../server/legal/store";
import { contextFrom } from "../../../lib/user-context";
import type { CaseDocument, DocumentConfidentiality } from "../../../server/legal/types";

export const config = { api: { bodyParser: { sizeLimit: "25mb" } } };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = contextFrom(req);

  if (req.method==="GET") {
    const caseId=String(req.query.caseId||"");
    if(!caseId) return res.status(400).json({ error:"caseId required" });
    return res.status(200).json(Documents.list(ctx.tenantId, caseId));
  }

  if (req.method==="POST") {
    const action = String(req.body?.action||"");

    if (action==="createBase64") {
      const { caseId, name, mime, size, dataUrl, confidentiality } = req.body||{};
      if (!caseId || !name || !mime || !size || !dataUrl) return res.status(400).json({ error: "invalid" });
      if (!Cases.get(ctx.tenantId, caseId)) Cases.upsertById({ id: caseId, tenantId: ctx.tenantId });
      const current = Documents.list(ctx.tenantId, caseId);
      const version = (current.filter(d=>d.name===name).sort((a,b)=>b.version-a.version)[0]?.version || 0) + 1;
      const d: CaseDocument = {
        id: uid(), tenantId: ctx.tenantId, caseId,
        name: String(name), mime: String(mime), size: Number(size),
        dataUrl: String(dataUrl), version, uploadedBy: ctx.userId,
        confidentiality: (confidentiality || "INTERNAL") as DocumentConfidentiality,
        createdAt: now()
      };
      Documents.add(d);
      Audit.add({ id: uid(), tenantId: ctx.tenantId, actorId: ctx.userId, action: "upload", entity: "document", entityId: d.id, at: now(), meta: { caseId } });
      return res.status(201).json(d);
    }

    if (action==="void") {
      const id = String(req.body?.id||""); const reason = String(req.body?.reason||"voided");
      const d = Documents.markVoid(id, reason); if (!d) return res.status(404).json({ error:"not_found" }); return res.status(200).json(d);
    }

    return res.status(400).json({ error:"invalid_action" });
  }

  res.setHeader("Allow","GET,POST"); return res.status(405).end();
}
