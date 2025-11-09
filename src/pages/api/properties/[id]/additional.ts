// src/pages/api/properties/[id]/additional.ts
// API لحفظ وقراءة البيانات الإضافية للعقار

import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const PROPERTIES_FILE = path.join(process.cwd(), '.data', 'properties.json');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'معرف العقار مطلوب' });
  }

  try {
    // قراءة ملف العقارات
    const propertiesData = fs.readFileSync(PROPERTIES_FILE, 'utf-8');
    const properties = JSON.parse(propertiesData);

    if (req.method === 'GET') {
      // قراءة البيانات الإضافية للعقار
      const property = properties.properties.find((p: any) => p.id === id);
      
      if (!property) {
        return res.status(404).json({ error: 'العقار غير موجود' });
      }

      // إرجاع البيانات الإضافية أو كائن فارغ
      return res.status(200).json({
        ownerData: property.additionalData?.ownerData || {},
        staffData: property.additionalData?.staffData || {},
        propertyData: property.additionalData?.propertyData || {},
        serviceAccounts: property.additionalData?.serviceAccounts || [],
        documents: property.additionalData?.documents || [],
        bankAccounts: property.additionalData?.bankAccounts || [],
        updatedAt: property.additionalData?.updatedAt || null
      });
    } 
    
    else if (req.method === 'POST' || req.method === 'PUT') {
      // حفظ البيانات الإضافية
      const propertyIndex = properties.properties.findIndex((p: any) => p.id === id);
      
      if (propertyIndex === -1) {
        return res.status(404).json({ error: 'العقار غير موجود' });
      }

      // تحديث البيانات الإضافية
      properties.properties[propertyIndex].additionalData = {
        ownerData: req.body.ownerData || {},
        staffData: req.body.staffData || {},
        propertyData: req.body.propertyData || {},
        serviceAccounts: req.body.serviceAccounts || [],
        documents: req.body.documents || [],
        bankAccounts: req.body.bankAccounts || [],
        updatedAt: new Date().toISOString()
      };

      // حفظ الملف
      fs.writeFileSync(
        PROPERTIES_FILE,
        JSON.stringify(properties, null, 2),
        'utf-8'
      );

      console.log(`✅ تم حفظ البيانات الإضافية للعقار ${id}`);

      return res.status(200).json({
        success: true,
        message: 'تم حفظ البيانات بنجاح',
        data: properties.properties[propertyIndex].additionalData
      });
    } 
    
    else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in additional data API:', error);
    return res.status(500).json({
      error: 'حدث خطأ في السيرفر',
      details: (error as Error).message
    });
  }
}

