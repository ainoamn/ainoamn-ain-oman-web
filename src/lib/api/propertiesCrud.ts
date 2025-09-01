// src/lib/api/propertiesCrud.ts
import path from "path";
// نستخدم نفس مُولِّد التسلسل المستخدم في /api/seq/next
import { issueNextSerial } from "@/lib/serialNumbers";

export type PropertyRecord = {
  id: string;                 // معرف داخلي
  referenceNo: string;        // الرقم المتسلسل الرسمي
  title?: string;
  city?: string;
  area?: number;
  beds?: number;
  baths?: number;
  price?: number;
  image?: string;
  type?: string;              // سكني/تجاري/...
  featured?: boolean;
  createdAt: string;          // ISO
  updatedAt: string;          // ISO
  [k: string]: any;           // أي حقول إضافية
};

// دالة مساعدة للحصول على مسار البيانات - تعمل على الخادم فقط
function getDataDirectory() {
  if (typeof window !== 'undefined') {
    throw new Error('لا يمكن استخدام هذه الدالة على جانب العميل');
  }
  return path.join(process.cwd(), "data", ".data");
}

// دالة مساعدة لضمان وجود ملف البيانات - تعمل على الخادم فقط
async function ensureDataFile() {
  if (typeof window !== 'undefined') {
    throw new Error('لا يمكن استخدام هذه الدالة على جانب العميل');
  }
  
  const { promises: fs } = await import("fs");
  const DATA_DIR = getDataDirectory();
  const FILE_PATH = path.join(DATA_DIR, "properties.json");
  
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(FILE_PATH);
  } catch {
    await fs.writeFile(FILE_PATH, "[]", "utf8");
  }
  
  return FILE_PATH;
}

export async function listProperties(): Promise<PropertyRecord[]> {
  // إذا كنا على العميل، نستخدم API route
  if (typeof window !== 'undefined') {
    try {
      const response = await fetch('/api/properties');
      return await response.json();
    } catch (error) {
      console.error('Error fetching properties from API:', error);
      return [];
    }
  }
  
  // إذا كنا على الخادم، نستخدم fs مباشرة
  try {
    const { promises: fs } = await import("fs");
    const FILE_PATH = await ensureDataFile();
    const raw = await fs.readFile(FILE_PATH, "utf8");
    const arr = (raw ? JSON.parse(raw) : []) as PropertyRecord[];
    return arr.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error reading properties data:', error);
    return [];
  }
}

export async function getFeaturedProperties(): Promise<PropertyRecord[]> {
  try {
    const properties = await listProperties();
    return properties.filter(prop => prop.featured).slice(0, 6);
  } catch (error) {
    console.error('Error getting featured properties:', error);
    return [];
  }
}

export async function createProperty(
  payload: Record<string, any>
): Promise<PropertyRecord> {
  // إذا كنا على العميل، نستخدم API route
  if (typeof window !== 'undefined') {
    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating property via API:', error);
      throw error;
    }
  }
  
  // إذا كنا على الخادم، نستخدم fs مباشرة
  try {
    const { promises: fs } = await import("fs");
    await ensureDataFile();
    
    // 1) توليد رقم مرجعي رسمي للكيان PROPERTY
    const seq = await issueNextSerial("PROPERTY");
    if (!seq?.ok || !seq.serial) {
      throw new Error(seq?.error || "Failed to issue serial");
    }

    // 2) بناء السجل
    const id = `prop_${Date.now()}`;
    const now = new Date().toISOString();
    const rec: PropertyRecord = {
      id,
      referenceNo: seq.serial, // مثل PR-2025-000001
      createdAt: now,
      updatedAt: now,
      ...payload,
    };

    // 3) كتابة إلى الملف
    const FILE_PATH = await ensureDataFile();
    const items = await listProperties();
    items.unshift(rec);
    await fs.writeFile(FILE_PATH, JSON.stringify(items, null, 2), "utf8");

    return rec;
  } catch (error) {
    console.error('Error creating property:', error);
    throw error;
  }
}