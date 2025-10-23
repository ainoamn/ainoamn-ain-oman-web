// src/pages/api/units/[id].ts - API إدارة الوحدات كعقارات منفصلة
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  try {
    const dbPath = path.join(process.cwd(), '.data', 'db.json');
    let db: any = { properties: [] };
    
    if (fs.existsSync(dbPath)) {
      const dbData = fs.readFileSync(dbPath, 'utf8');
      db = JSON.parse(dbData);
    }
    
    // البحث عن الوحدة في properties (الوحدة كعقار منفصل)
    const unitIndex = db.properties.findIndex((p: any) => p.id === id && p.isUnit);
    
    if (req.method === 'GET') {
      if (unitIndex === -1) {
        return res.status(404).json({ error: 'الوحدة غير موجودة' });
      }
      
      return res.status(200).json({ 
        item: db.properties[unitIndex],
        success: true
      });
    }
    
    if (req.method === 'PUT') {
      if (unitIndex === -1) {
        return res.status(404).json({ error: 'الوحدة غير موجودة' });
      }
      
      const updatedUnit = {
        ...db.properties[unitIndex],
        ...req.body,
        id: db.properties[unitIndex].id, // الحفاظ على المعرف
        isUnit: true, // التأكيد أنها وحدة
        parentPropertyId: db.properties[unitIndex].parentPropertyId, // الحفاظ على الربط
        updatedAt: new Date().toISOString()
      };
      
      db.properties[unitIndex] = updatedUnit;
      
      // حفظ
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
      
      return res.status(200).json({ 
        item: updatedUnit,
        success: true,
        message: 'تم تحديث الوحدة بنجاح'
      });
    }
    
    if (req.method === 'DELETE') {
      if (unitIndex === -1) {
        return res.status(404).json({ error: 'الوحدة غير موجودة' });
      }
      
      // حذف الوحدة
      db.properties.splice(unitIndex, 1);
      
      // حفظ
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
      
      return res.status(200).json({ 
        success: true,
        message: 'تم حذف الوحدة بنجاح'
      });
    }
    
    if (req.method === 'PATCH') {
      // تحديث جزئي (مثلاً: نشر/إخفاء، أرشفة)
      if (unitIndex === -1) {
        return res.status(404).json({ error: 'الوحدة غير موجودة' });
      }
      
      db.properties[unitIndex] = {
        ...db.properties[unitIndex],
        ...req.body,
        updatedAt: new Date().toISOString()
      };
      
      // حفظ
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
      
      return res.status(200).json({ 
        item: db.properties[unitIndex],
        success: true,
        message: 'تم تحديث الوحدة بنجاح'
      });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Error in units API:', error);
    return res.status(500).json({ 
      error: 'خطأ في الخادم',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    });
  }
}

