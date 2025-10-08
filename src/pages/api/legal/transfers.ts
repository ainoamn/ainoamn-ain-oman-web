import type { NextApiRequest, NextApiResponse } from "next";
import { Transfers, uid, now, Audit } from "../../../server/legal/store";
import { contextFrom } from "../../../lib/user-context";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = contextFrom(req);

  if (req.method === "GET") {
    const { caseId } = req.query;
    const transfers = Transfers.list(ctx.tenantId, caseId as string);
    return res.status(200).json(transfers);
  }

  if (req.method === "POST") {
    const transferData = req.body;
    
    try {
      const transfer = Transfers.create(ctx.tenantId, {
        tenantId: ctx.tenantId,
        caseId: transferData.caseId,
        transferType: transferData.transferType,
        fromLawyerId: transferData.fromLawyerId,
        toLawyerId: transferData.toLawyerId,
        toCourtId: transferData.toCourtId,
        toPoliceStationId: transferData.toPoliceStationId,
        toProsecutionId: transferData.toProsecutionId,
        reason: transferData.reason,
        status: "PENDING",
        documents: transferData.documents || [],
        notes: transferData.notes,
        transferredBy: ctx.userId
      });

      Audit.add({
        id: uid(),
        tenantId: ctx.tenantId,
        actorId: ctx.userId,
        action: "transferCreate",
        entity: "case",
        entityId: transfer.id,
        at: now(),
        meta: {
          caseId: transfer.caseId,
          transferType: transfer.transferType,
          transferNumber: transfer.transferNumber
        }
      });

      return res.status(201).json(transfer);
    } catch (error) {
      console.error("Transfer creation error:", error);
      return res.status(500).json({ error: "Failed to create transfer" });
    }
  }

  if (req.method === "PATCH") {
    const { id, action, ...data } = req.body;
    
    if (!id) return res.status(400).json({ error: "id_required" });
    
    try {
      let result;
      
      switch (action) {
        case "updateStatus":
          result = Transfers.updateStatus(ctx.tenantId, id, data.status, ctx.userId, data.notes);
          break;
        default:
          return res.status(400).json({ error: "invalid_action" });
      }
      
      if (!result) return res.status(404).json({ error: "transfer_not_found" });
      
      Audit.add({
        id: uid(),
        tenantId: ctx.tenantId,
        actorId: ctx.userId,
        action: `transfer_${action}`,
        entity: "case",
        entityId: id,
        at: now(),
        meta: data
      });
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Transfer update error:", error);
      return res.status(500).json({ error: "Failed to update transfer" });
    }
  }

  res.setHeader("Allow", "GET,POST,PATCH");
  return res.status(405).end();
}
