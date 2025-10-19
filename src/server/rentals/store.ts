// src/server/rentals/store.ts
import { Rental } from "@/types/rentals";
import { db } from "@/server/db"; // افترض أن لديك اتصال بقاعدة البيانات

export async function load(id: string): Promise<Rental | null> {
  try {
    return await db.rental.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

export async function save(r: Rental): Promise<Rental> {
  r.updatedAt = Date.now();
  
  // حفظ في قاعدة البيانات
  const existing = await db.rental.findUnique({ where: { id: r.id } });
  
  if (existing) {
    return await db.rental.update({
      where: { id: r.id },
      data: r
    });
  } else {
    return await db.rental.create({ data: r });
  }
}

export async function listByProperty(propertyId: string): Promise<Rental[]> {
  return await db.rental.findMany({ 
    where: { propertyId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function listAll(): Promise<Rental[]> {
  return await db.rental.findMany({ orderBy: { createdAt: 'desc' } });
}
