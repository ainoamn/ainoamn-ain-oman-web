// src/pages/api/tasks/simple.ts - API مبسط للمهام
import type { NextApiRequest, NextApiResponse } from "next";
import { getNextSequenceNumber } from "@/server/serialNumbers";
import fs from "fs";
import path from "path";

// مسارات الملفات
const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// ضمان وجود المجلدات
function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// قراءة قاعدة البيانات
function readDb(): any {
  try {
    ensureDir();
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify({ tasks: [] }, null, 2), "utf8");
    }
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8") || "{}");
  } catch {
    return { tasks: [] };
  }
}

// كتابة قاعدة البيانات
function writeDb(db: any) {
  ensureDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(db ?? {}, null, 2), "utf8");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // منع التخزين المؤقت
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  try {
    if (req.method === "GET") {
      // الحصول على المهام
      const propertyId = req.query.propertyId ? String(req.query.propertyId) : undefined;
      const db = readDb();
      let tasks = Array.isArray(db.tasks) ? db.tasks : [];
      
      // فلترة حسب propertyId إذا تم توفيره
      if (propertyId) {
        tasks = tasks.filter((task: any) => 
          task.propertyId === propertyId || 
          task.relatedEntity?.id === propertyId
        );
      }
      
      // ترتيب حسب تاريخ التحديث
      tasks.sort((a: any, b: any) => 
        String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || ""))
      );
      
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
      const serialNumber = await getNextSequenceNumber();
      const now = new Date().toISOString();
      
      const newTask = {
        ...taskData,
        id: serialNumber,
        createdAt: now,
        updatedAt: now,
      };
      
      // حفظ في قاعدة البيانات
      const db = readDb();
      db.tasks = Array.isArray(db.tasks) ? db.tasks : [];
      db.tasks.push(newTask);
      writeDb(db);
      
      console.log("Task created successfully:", newTask);
      
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
      
      const db = readDb();
      const taskIndex = db.tasks?.findIndex((t: any) => t.id === id);
      
      if (taskIndex !== undefined && taskIndex >= 0) {
        db.tasks[taskIndex] = {
          ...db.tasks[taskIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        writeDb(db);
        
        console.log("Task updated successfully:", db.tasks[taskIndex]);
        
        return res.status(200).json({
          success: true,
          task: db.tasks[taskIndex],
          message: "Task updated successfully"
        });
      } else {
        return res.status(404).json({ error: "Task not found" });
      }
    }

    res.setHeader("Allow", "GET,POST,PATCH");
    return res.status(405).json({ error: "Method not allowed" });

  } catch (error: any) {
    console.error("Simple tasks API error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message
    });
  }
}

