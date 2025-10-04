// src/pages/api/tasks/unified.ts - API موحد للمهام
import type { NextApiRequest, NextApiResponse } from "next";
import { 
  getAllTasks, 
  createTask, 
  updateTask, 
  fullSync, 
  broadcastTaskUpdate 
} from "@/lib/tasksSync";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // منع التخزين المؤقت
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  try {
    if (req.method === "GET") {
      // الحصول على المهام
      const propertyId = req.query.propertyId ? String(req.query.propertyId) : undefined;
      const tasks = getAllTasks(propertyId);
      
      return res.status(200).json({
        success: true,
        tasks,
        count: tasks.length,
        propertyId
      });
    }

    if (req.method === "POST") {
      // إنشاء مهمة جديدة
      const taskData = req.body;
      const newTask = await createTask(taskData);
      
      // إرسال إشعار التحديث
      broadcastTaskUpdate(newTask.id, newTask.propertyId);
      
      return res.status(201).json({
        success: true,
        task: newTask
      });
    }

    if (req.method === "PATCH") {
      // تحديث مهمة
      const { id, ...updates } = req.body;
      if (!id) {
        return res.status(400).json({ error: "Task ID is required" });
      }
      
      const success = updateTask(id, updates);
      if (success) {
        // إرسال إشعار التحديث
        broadcastTaskUpdate(id, updates.propertyId);
        
        return res.status(200).json({
          success: true,
          message: "Task updated successfully"
        });
      } else {
        return res.status(500).json({ error: "Failed to update task" });
      }
    }

    if (req.method === "PUT" && req.query.action === "sync") {
      // مزامنة يدوية
      const result = fullSync();
      
      return res.status(200).json({
        success: true,
        message: "Sync completed",
        result
      });
    }

    res.setHeader("Allow", "GET,POST,PATCH,PUT");
    return res.status(405).json({ error: "Method not allowed" });

  } catch (error: any) {
    console.error("Unified tasks API error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message
    });
  }
}

