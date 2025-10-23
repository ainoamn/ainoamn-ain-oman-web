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
    let unitIndex = db.properties.findIndex((p: any) => p.id === id && p.isUnit);
    
    // إذا لم نجدها كعقار منفصل، ابحث في units[] داخل العقارات
    let parentProperty: any = null;
    let unitData: any = null;
    let unitIndexInArray: number = -1;
    
    if (unitIndex === -1) {
      // البحث في units[] داخل كل عقار
      for (const property of db.properties) {
        if (property.units && Array.isArray(property.units)) {
          const foundUnitIndex = property.units.findIndex((u: any) => u.id === id);
          if (foundUnitIndex !== -1) {
            parentProperty = property;
            unitData = property.units[foundUnitIndex];
            unitIndexInArray = foundUnitIndex;
            break;
          }
        }
      }
    }
    
    if (req.method === 'GET') {
      // إذا وجدناها كعقار منفصل
      if (unitIndex !== -1) {
        return res.status(200).json({ 
          item: db.properties[unitIndex],
          success: true
        });
      }
      
      // إذا وجدناها في units[]
      if (unitData && parentProperty) {
        // تحويلها إلى شكل عقار منفصل للعرض
        const unitAsProperty = {
          ...unitData,
          id: unitData.id,
          referenceNo: unitData.referenceNo || `UNIT-${parentProperty.referenceNo || parentProperty.id}-${unitData.unitNo}`,
          isUnit: true,
          parentPropertyId: parentProperty.id,
          
          // نسخ من الأم
          province: unitData.province || parentProperty.province,
          state: unitData.state || parentProperty.state,
          city: unitData.city || parentProperty.city,
          address: unitData.address || `${parentProperty.address} - وحدة ${unitData.unitNo}`,
          latitude: unitData.latitude || parentProperty.latitude,
          longitude: unitData.longitude || parentProperty.longitude,
          mapAddress: unitData.mapAddress || parentProperty.mapAddress,
          surveyNumber: unitData.surveyNumber || parentProperty.surveyNumber,
          landNumber: unitData.landNumber || parentProperty.landNumber,
          ownerName: unitData.ownerName || parentProperty.ownerName,
          ownerPhone: unitData.ownerPhone || parentProperty.ownerPhone,
          ownerEmail: unitData.ownerEmail || parentProperty.ownerEmail,
          amenities: [...(parentProperty.amenities || []), ...(unitData.amenities || [])],
          customAmenities: [...(parentProperty.customAmenities || []), ...(unitData.features || [])],
          
          titleAr: unitData.titleAr || `وحدة ${unitData.unitNo} - ${parentProperty.titleAr || ''}`,
          titleEn: unitData.titleEn || `Unit ${unitData.unitNo} - ${parentProperty.titleEn || ''}`,
          descriptionAr: unitData.descriptionAr || parentProperty.descriptionAr,
          descriptionEn: unitData.descriptionEn || parentProperty.descriptionEn,
        };
        
        return res.status(200).json({ 
          item: unitAsProperty,
          success: true
        });
      }
      
      return res.status(404).json({ error: 'الوحدة غير موجودة' });
    }
    
    if (req.method === 'PUT') {
      // تحديث وحدة منفصلة
      if (unitIndex !== -1) {
        const updatedUnit = {
          ...db.properties[unitIndex],
          ...req.body,
          id: db.properties[unitIndex].id,
          isUnit: true,
          parentPropertyId: db.properties[unitIndex].parentPropertyId,
          updatedAt: new Date().toISOString()
        };
        
        db.properties[unitIndex] = updatedUnit;
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
        
        return res.status(200).json({ 
          item: updatedUnit,
          success: true,
          message: 'تم تحديث الوحدة بنجاح'
        });
      }
      
      // تحديث وحدة داخل units[]
      if (unitData && parentProperty) {
        const parentIndex = db.properties.findIndex((p: any) => p.id === parentProperty.id);
        if (parentIndex !== -1) {
          db.properties[parentIndex].units[unitIndexInArray] = {
            ...unitData,
            ...req.body,
            id: unitData.id,
            updatedAt: new Date().toISOString()
          };
          
          db.properties[parentIndex].updatedAt = new Date().toISOString();
          fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
          
          return res.status(200).json({ 
            item: db.properties[parentIndex].units[unitIndexInArray],
            success: true,
            message: 'تم تحديث الوحدة بنجاح'
          });
        }
      }
      
      return res.status(404).json({ error: 'الوحدة غير موجودة' });
    }
    
    if (req.method === 'DELETE') {
      // حذف وحدة منفصلة
      if (unitIndex !== -1) {
        db.properties.splice(unitIndex, 1);
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
        
        return res.status(200).json({ 
          success: true,
          message: 'تم حذف الوحدة بنجاح'
        });
      }
      
      // حذف وحدة من units[]
      if (unitData && parentProperty) {
        const parentIndex = db.properties.findIndex((p: any) => p.id === parentProperty.id);
        if (parentIndex !== -1) {
          db.properties[parentIndex].units.splice(unitIndexInArray, 1);
          db.properties[parentIndex].totalUnits = db.properties[parentIndex].units.length;
          db.properties[parentIndex].updatedAt = new Date().toISOString();
          
          fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
          
          return res.status(200).json({ 
            success: true,
            message: 'تم حذف الوحدة بنجاح'
          });
        }
      }
      
      return res.status(404).json({ error: 'الوحدة غير موجودة' });
    }
    
    if (req.method === 'PATCH') {
      // تحديث وحدة منفصلة
      if (unitIndex !== -1) {
        db.properties[unitIndex] = {
          ...db.properties[unitIndex],
          ...req.body,
          updatedAt: new Date().toISOString()
        };
        
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
        
        return res.status(200).json({ 
          item: db.properties[unitIndex],
          success: true,
          message: 'تم تحديث الوحدة بنجاح'
        });
      }
      
      // تحديث وحدة داخل units[]
      if (unitData && parentProperty) {
        const parentIndex = db.properties.findIndex((p: any) => p.id === parentProperty.id);
        if (parentIndex !== -1) {
          db.properties[parentIndex].units[unitIndexInArray] = {
            ...db.properties[parentIndex].units[unitIndexInArray],
            ...req.body,
            updatedAt: new Date().toISOString()
          };
          
          db.properties[parentIndex].updatedAt = new Date().toISOString();
          fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
          
          return res.status(200).json({ 
            item: db.properties[parentIndex].units[unitIndexInArray],
            success: true,
            message: 'تم تحديث الوحدة بنجاح'
          });
        }
      }
      
      return res.status(404).json({ error: 'الوحدة غير موجودة' });
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

