// src/lib/tasksSync.ts - نظام موحد لمزامنة المهام
import { getNextSequenceNumber } from "@/server/serialNumbers";
import fs from "fs";
import path from "path";
import { getTask, patchTask, listTasks } from "@/server/db";

// مسارات الملفات
const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const TASKS_FILE = path.join(DATA_DIR, "tasks.json");

// ضمان وجود المجلدات
function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// قراءة قاعدة البيانات الأساسية
function readBasicDb(): any {
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

// كتابة قاعدة البيانات الأساسية
function writeBasicDb(db: any) {
  ensureDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(db ?? {}, null, 2), "utf8");
}

// مزامنة المهام من النظام المتقدم إلى النظام الأساسي
export function syncAdvancedToBasic() {
  try {
    const advancedTasks = listTasks();
    const basicDb = readBasicDb();
    
    // دمج المهام المتقدمة مع الأساسية
    const existingTasks = new Map();
    (basicDb.tasks || []).forEach((task: any) => {
      existingTasks.set(task.id, task);
    });
    
    // إضافة/تحديث المهام المتقدمة
    advancedTasks.forEach((task: any) => {
      const basicTask = {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee: task.assignees?.[0] || null,
        dueDate: task.dueDate,
        type: task.type || "maintenance",
        propertyId: task.link?.id || task.propertyId,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        // معلومات إضافية من النظام المتقدم
        relatedEntity: task.link,
        assignees: task.assignees,
        labels: task.labels,
        thread: task.thread,
        attachments: task.attachments
      };
      existingTasks.set(task.id, basicTask);
    });
    
    basicDb.tasks = Array.from(existingTasks.values());
    writeBasicDb(basicDb);
    
    console.log(`Synced ${advancedTasks.length} advanced tasks to basic system`);
    return basicDb.tasks;
  } catch (error) {
    console.error("Error syncing advanced to basic:", error);
    return [];
  }
}

// مزامنة المهام من النظام الأساسي إلى النظام المتقدم
export function syncBasicToAdvanced() {
  try {
    const basicDb = readBasicDb();
    const basicTasks = basicDb.tasks || [];
    
    // تحديث المهام في النظام المتقدم
    basicTasks.forEach((task: any) => {
      try {
        const existingTask = getTask(task.id);
        if (existingTask) {
          // تحديث المهمة الموجودة
          patchTask(task.id, {
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate,
            assignees: task.assignees || (task.assignee ? [task.assignee] : []),
            labels: task.labels || [],
            link: task.relatedEntity || (task.propertyId ? { type: "property", id: task.propertyId } : undefined)
          });
        }
      } catch (error) {
        console.error(`Error syncing task ${task.id}:`, error);
      }
    });
    
    console.log(`Synced ${basicTasks.length} basic tasks to advanced system`);
    return basicTasks;
  } catch (error) {
    console.error("Error syncing basic to advanced:", error);
    return [];
  }
}

// مزامنة كاملة في كلا الاتجاهين
export function fullSync() {
  console.log("Starting full tasks sync...");
  
  // مزامنة من المتقدم إلى الأساسي
  const basicTasks = syncAdvancedToBasic();
  
  // مزامنة من الأساسي إلى المتقدم
  const advancedTasks = syncBasicToAdvanced();
  
  console.log("Full sync completed");
  return { basicTasks, advancedTasks };
}

// إنشاء مهمة جديدة في كلا النظامين
export async function createTask(taskData: any) {
  try {
    const serialNumber = await getNextSequenceNumber();
    const now = new Date().toISOString();
    
    const newTask = {
      ...taskData,
      id: serialNumber,
      createdAt: now,
      updatedAt: now,
      // ضمان حفظ bookingId إذا كان موجوداً
      bookingId: taskData.bookingId,
    };
    
    // حفظ في النظام الأساسي
    const basicDb = readBasicDb();
    basicDb.tasks = Array.isArray(basicDb.tasks) ? basicDb.tasks : [];
    basicDb.tasks.push(newTask);
    writeBasicDb(basicDb);
    
    // حفظ في النظام المتقدم مباشرة
    try {
      const advancedTask = {
        id: newTask.id,
        title: newTask.title,
        description: newTask.description,
        status: newTask.status || "open",
        priority: newTask.priority || "medium",
        dueDate: newTask.dueDate,
        assignees: newTask.assignees || (newTask.assignee ? [newTask.assignee] : []),
        labels: newTask.labels || [],
        link: newTask.relatedEntity || (newTask.propertyId ? { type: "property", id: newTask.propertyId } : undefined),
        createdAt: newTask.createdAt,
        updatedAt: newTask.updatedAt,
        thread: [],
        attachments: [],
        // حفظ bookingId في النظام المتقدم
        bookingId: newTask.bookingId
      };
      
      // استخدام دالة patchTask مباشرة بدلاً من fetch
      patchTask(newTask.id, advancedTask);
      console.log("Task created in advanced system successfully");
    } catch (error) {
      console.warn("Error creating task in advanced system:", error);
    }
    
    return newTask;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
}

// تحديث مهمة في كلا النظامين
export function updateTask(taskId: string, updates: any) {
  try {
    // تحديث في النظام الأساسي
    const basicDb = readBasicDb();
    const taskIndex = basicDb.tasks?.findIndex((t: any) => t.id === taskId);
    if (taskIndex !== undefined && taskIndex >= 0) {
      basicDb.tasks[taskIndex] = {
        ...basicDb.tasks[taskIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      writeBasicDb(basicDb);
    }
    
    // تحديث في النظام المتقدم
    try {
      patchTask(taskId, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.warn("Error updating task in advanced system:", error);
    }
    
    return true;
  } catch (error) {
    console.error("Error updating task:", error);
    return false;
  }
}

// الحصول على جميع المهام من كلا النظامين
export function getAllTasks(propertyId?: string) {
  try {
    // مزامنة أولاً
    fullSync();
    
    // الحصول على المهام من النظام الأساسي (المحدث)
    const basicDb = readBasicDb();
    let tasks = basicDb.tasks || [];
    
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
    
    return tasks;
  } catch (error) {
    console.error("Error getting all tasks:", error);
    return [];
  }
}

// إرسال إشعارات التحديث
export function broadcastTaskUpdate(taskId: string, propertyId?: string) {
  try {
    const bc = new BroadcastChannel("ao_tasks");
    const message = { 
      type: "updated", 
      taskId, 
      propertyId,
      timestamp: Date.now()
    };
    bc.postMessage(message);
    bc.close();
    
    // تحديث localStorage
    localStorage.setItem("ao_tasks_bump", Date.now().toString());
    
    console.log("Broadcasted task update:", message);
  } catch (error) {
    console.error("Error broadcasting task update:", error);
  }
}