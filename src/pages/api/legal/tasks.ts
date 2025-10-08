import type { NextApiRequest, NextApiResponse } from "next";
import { LegalTasks, uid, now, Audit } from "../../../server/legal/store";
import { contextFrom } from "../../../lib/user-context";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = contextFrom(req);

  if (req.method === "GET") {
    const { caseId, assignedTo } = req.query;
    const tasks = LegalTasks.list(ctx.tenantId, caseId as string, assignedTo as string);
    return res.status(200).json(tasks);
  }

  if (req.method === "POST") {
    const taskData = req.body;
    
    try {
      const task = LegalTasks.create(ctx.tenantId, {
        tenantId: ctx.tenantId,
        caseId: taskData.caseId,
        title: taskData.title,
        description: taskData.description,
        taskType: taskData.taskType,
        priority: taskData.priority || "MEDIUM",
        status: "PENDING",
        assignedTo: taskData.assignedTo,
        assignedBy: ctx.userId,
        dueDate: taskData.dueDate,
        notes: taskData.notes,
        relatedDocuments: taskData.relatedDocuments || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      Audit.add({
        id: uid(),
        tenantId: ctx.tenantId,
        actorId: ctx.userId,
        action: "legalTaskCreate",
        entity: "case",
        entityId: task.id,
        at: now(),
        meta: {
          caseId: task.caseId,
          taskType: task.taskType,
          priority: task.priority,
          assignedTo: task.assignedTo
        }
      });

      return res.status(201).json(task);
    } catch (error) {
      console.error("Legal task creation error:", error);
      return res.status(500).json({ error: "Failed to create legal task" });
    }
  }

  if (req.method === "PATCH") {
    const { id, action, ...data } = req.body;
    
    if (!id) return res.status(400).json({ error: "id_required" });
    
    try {
      let result;
      
      switch (action) {
        case "updateStatus":
          result = LegalTasks.updateStatus(ctx.tenantId, id, data.status, ctx.userId);
          break;
        default:
          return res.status(400).json({ error: "invalid_action" });
      }
      
      if (!result) return res.status(404).json({ error: "task_not_found" });
      
      Audit.add({
        id: uid(),
        tenantId: ctx.tenantId,
        actorId: ctx.userId,
        action: `legalTask_${action}`,
        entity: "case",
        entityId: id,
        at: now(),
        meta: data
      });
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Legal task update error:", error);
      return res.status(500).json({ error: "Failed to update legal task" });
    }
  }

  res.setHeader("Allow", "GET,POST,PATCH");
  return res.status(405).end();
}
