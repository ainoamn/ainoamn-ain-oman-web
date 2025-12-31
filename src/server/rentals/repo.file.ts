// src/server/rentals/repo.file.ts
import fs from "fs"; import path from "path";
import type { Rental, RentalRepository } from "./repo";

const ROOT = path.resolve(process.cwd(), ".data/rentals");
const ensure = () => fs.mkdirSync(ROOT, { recursive: true });
const fpath = (id: string) => (ensure(), path.join(ROOT, `${id}.json`));

function readAll(): Rental[] {
  ensure();
  const allFiles = fs.readdirSync(ROOT).filter(f => f.endsWith(".json"));
  const allRentals = allFiles.map(f => {
    try {
      return JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8")) as Rental;
    } catch (error) {
      console.error(`❌ خطأ في قراءة ملف العقد ${f}:`, error);
      return null;
    }
  }).filter((r): r is Rental => r !== null);
  
  // إزالة التكرارات بناءً على id (احترازي)
  const uniqueRentals = allRentals.reduce((acc: Rental[], rental: Rental) => {
    const exists = acc.find(r => r.id === rental.id);
    if (!exists) {
      acc.push(rental);
    } else {
      console.warn(`⚠️ عقد مكرر تم تجاهله: ${rental.id}`);
    }
    return acc;
  }, []);
  
  if (allRentals.length !== uniqueRentals.length) {
    console.log(`⚠️ تمت إزالة ${allRentals.length - uniqueRentals.length} عقد مكرر في readAll()`);
  }
  
  return uniqueRentals;
}

// دالة لجلب ownerId من العقار
function getPropertyOwnerId(propertyId: string): string | null {
  try {
    // المحاولة 1: من db.json
    const dbPath = path.resolve(process.cwd(), ".data", "db.json");
    if (fs.existsSync(dbPath)) {
      const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      if (db.properties && Array.isArray(db.properties)) {
        const property = db.properties.find((p: any) => p.id === propertyId || p.referenceNo === propertyId);
        if (property) {
          return property.ownerId || property.createdBy || property.userId || null;
        }
      }
    }
    
    // المحاولة 2: من ملفات .data/properties/
    const propertiesPath = path.resolve(process.cwd(), ".data", "properties");
    if (fs.existsSync(propertiesPath)) {
      const propertyFiles = fs.readdirSync(propertiesPath).filter(f => f.endsWith(".json"));
      for (const file of propertyFiles) {
        try {
          const filePath = path.join(propertiesPath, file);
          const propertyData = JSON.parse(fs.readFileSync(filePath, "utf8"));
          if (propertyData.id === propertyId || propertyData.referenceNo === propertyId || file.replace('.json', '') === propertyId) {
            return propertyData.ownerId || propertyData.createdBy || propertyData.userId || null;
          }
        } catch (err) {
          // تجاهل الأخطاء
        }
      }
    }
  } catch (err) {
    // تجاهل الأخطاء
  }
  return null;
}

export class FileRentalRepo implements RentalRepository {
  async load(id: string) { const p = fpath(id); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null; }
  async save(r: Rental) { r.updatedAt = Date.now(); fs.writeFileSync(fpath(r.id), JSON.stringify(r, null, 2), "utf8"); return r; }
  async listByProperty(propertyId: string) { return readAll().filter(r => r.propertyId === propertyId); }
  
  async listMine(userId: string) {
    const allRentals = readAll();
    return allRentals.filter(r => {
      // 1. المستأجر يرى عقوده
      if (r.tenantId === userId) return true;
      
      // 2. المالك يرى عقود عقاراته
      if (r.propertyId) {
        const ownerId = getPropertyOwnerId(r.propertyId);
        if (ownerId === userId) return true;
      }
      
      // 3. من شارك في التاريخ (توقيعات، موافقات، إلخ)
      if (r.history && r.history.some((h: any) => h.by === userId)) return true;
      
      // 4. من أنشأ العقد أو الموقع عليه (من signatures)
      if ((r as any).signatures && Array.isArray((r as any).signatures)) {
        const sigs = (r as any).signatures;
        if (sigs.some((s: any) => s.signedBy === userId || s.email === userId)) return true;
      }
      
      // 5. المالك من بيانات العقد المضافة (ownerName أو ownerEmail)
      if ((r as any).ownerId === userId || (r as any).ownerEmail === userId) return true;
      
      return false;
    });
  }
  
  async listAll() { return readAll(); }
}
