// src/pages/api/ai/tasks/assist.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getTask } from "@/server/db";

// Simple rule-based assistant (no external calls).
// Generates a short "AI summary" and "next steps" based on task content.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.setHeader("Allow", "POST").status(405).end();

  const { id } = req.body || {};
  if (!id || typeof id !== "string") return res.status(400).json({ error: "id required" });

  const t = getTask(id);
  if (!t) return res.status(404).json({ error: "Task not found" });

  const text = `${t.title}\n${t.description || ""}\n${t.thread.map(x => x.text).join("\n")}`.slice(0, 2000);

  // naive priority/status suggestions
  const hints: string[] = [];
  if (/blocked|تعطل|معلق/i.test(text)) hints.push("اقترح الحالة: معلقة (Blocked) حتى إزالة العائق.");
  if (/urgent|عاجل/i.test(text)) hints.push("اقترح أولوية: عاجلة (Urgent) والمتابعة خلال 24 ساعة.");
  if (t.dueDate) hints.push(`تذكير بالاستحقاق: ${t.dueDate}`);

  const summary = truncate(
    `ملخص ذكي: المهمة "${t.title}". ${t.description ? "الوصف: "+t.description+". " : ""}تتضمن المحادثة عدد ${t.thread.length} رسائل. ${hints.join(" ") || ""}`,
    320
  );

  const nextSteps = [
    "تحقق من المتطلبات وحدد نطاق المهمة (Scope).",
    "قسّم المهمة إلى خطوات صغيرة قابلة للتنفيذ.",
    "أضف تاريخ استحقاق واضح وتابع التقدم يوميًا.",
  ];

  return res.status(200).json({
    ok: true,
    summary,
    nextSteps,
    hints,
  });
}

function truncate(s: string, n: number) {
  return s.length > n ? (s.slice(0, n-1) + "…") : s;
}
