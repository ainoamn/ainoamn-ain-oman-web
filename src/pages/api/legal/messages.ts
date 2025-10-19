import type { NextApiRequest, NextApiResponse } from "next";
import { Messages, uid, now, Audit } from "../../../server/legal/store";
import { contextFrom } from "../../../lib/user-context";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = contextFrom(req);

  if (req.method === "GET") {
    try {
      const { caseId } = req.query;
      const messages = Messages.list(ctx.tenantId, caseId as string);
      return res.status(200).json(messages);
    } catch (error) {
      console.error('Error getting messages:', error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    try {
      const { caseId, content, type = 'update', attachments = [] } = req.body;
      
      if (!caseId || !content) {
        return res.status(400).json({ error: "Case ID and content are required" });
      }

      const message = Messages.add(ctx.tenantId, caseId, {
        content,
        type,
        attachments,
        createdBy: ctx.userId,
        by: ctx.userId,
        text: content,
        at: new Date().toISOString()
      });

      Audit.add({ 
        id: uid(), 
        tenantId: ctx.tenantId, 
        actorId: ctx.userId, 
        action: "messageAdd", 
        entity: "message", 
        entityId: message.id, 
        at: now(), 
        meta: { 
          caseId,
          messageType: type
        } 
      });

      return res.status(201).json(message);
    } catch (error) {
      console.error('Error adding message:', error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
