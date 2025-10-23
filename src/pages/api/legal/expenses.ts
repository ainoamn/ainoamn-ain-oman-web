import type { NextApiRequest, NextApiResponse } from "next";
import { Expenses, uid, now, Audit } from "../../../server/legal/store";
import { contextFrom } from "../../../lib/user-context";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = contextFrom(req);

  if (req.method === "GET") {
    try {
      const { caseId } = req.query;
      const expenses = Expenses.list(ctx.tenantId, caseId as string);
      return res.status(200).json(expenses);
    } catch (error) {
      console.error('Error getting expenses:', error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    try {
      const { caseId, description, amount, type, date, receipt } = req.body;
      
      if (!caseId || !description || !amount) {
        return res.status(400).json({ error: "Case ID, description, and amount are required" });
      }

      const expense = Expenses.add(ctx.tenantId, caseId, {
        description,
        amount: parseFloat(amount),
        type: type || 'legal_fee',
        date: date || new Date().toISOString(),
        receipt,
        createdBy: ctx.userId,
        by: ctx.userId,
        label: description,
        at: date || new Date().toISOString()
      });

      Audit.add({ 
        id: uid(), 
        tenantId: ctx.tenantId, 
        actorId: ctx.userId, 
        action: "expenseAdd", 
        entity: "expense", 
        entityId: expense.id, 
        at: now(), 
        meta: { 
          caseId,
          amount: expense.amount,
          type: expense.type
        } 
      });

      return res.status(201).json(expense);
    } catch (error) {
      console.error('Error adding expense:', error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}