// src/pages/api/units/[id]/edit.ts - تحديث وحدة داخل units[]
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const dbPath = path.join(process.cwd(), '.data', 'db.json');
    let db: any = { properties: [] };
    
    if (fs.existsSync(dbPath)) {
      const dbData = fs.readFileSync(dbPath, 'utf8');
      db = JSON.parse(dbData);
    }
    
    // البحث عن الوحدة في units[]
    let found = false;
    for (let i = 0; i < db.properties.length; i++) {
      const property = db.properties[i];
      
      if (property.units && Array.isArray(property.units)) {
        const unitIndex = property.units.findIndex((u: any) => u.id === id);
        
        if (unitIndex !== -1) {
          // تحديث الوحدة
          db.properties[i].units[unitIndex] = {
            ...db.properties[i].units[unitIndex],
            ...req.body,
            id: db.properties[i].units[unitIndex].id, // الحفاظ على ID
            parentPropertyId: property.id, // الحفاظ على الربط
            updatedAt: new Date().toISOString()
          };
          
          // تحديث تاريخ العقار الأم
          db.properties[i].updatedAt = new Date().toISOString();
          
          // حفظ
          fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
          
          found = true;
          
          return res.status(200).json({
            success: true,
            item: db.properties[i].units[unitIndex],
            message: 'تم تحديث الوحدة بنجاح'
          });
        }
      }
    }
    
    if (!found) {
      return res.status(404).json({ error: 'الوحدة غير موجودة' });
    }
    
  } catch (error) {
    console.error('Error updating unit:', error);
    return res.status(500).json({ 
      error: 'خطأ في الخادم',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    });
  }
}

