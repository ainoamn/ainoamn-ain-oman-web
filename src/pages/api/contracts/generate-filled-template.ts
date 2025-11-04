// src/pages/api/contracts/generate-filled-template.ts
// API endpoint لتوليد قالب مملوء تلقائياً بالبيانات

import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { fillTemplate, selectBestTemplate } from '@/lib/templateFiller';

const templatesPath = path.join(process.cwd(), '.data', 'contract-templates.json');
const propertiesPath = path.join(process.cwd(), '.data', 'db.json');
const usersPath = path.join(process.cwd(), '.data', 'users.json');

interface RequestBody {
  templateId?: string;
  propertyId: string;
  unitId?: string;
  tenantId?: string;
  tenantData?: {
    name: string;
    phone: string;
    email: string;
    idNumber?: string;
    address?: string;
  };
  contractData: {
    startDate: string;
    endDate: string;
    duration: number;
    monthlyRent: number;
    deposit: number;
    currency: string;
    paymentDay?: number;
    customTerms?: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body: RequestBody = req.body;

    // 1. قراءة القوالب
    if (!fs.existsSync(templatesPath)) {
      return res.status(404).json({ error: 'Templates file not found' });
    }
    const templatesData = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
    const templates = templatesData.templates || [];

    // 2. قراءة بيانات العقارات
    if (!fs.existsSync(propertiesPath)) {
      return res.status(404).json({ error: 'Properties file not found' });
    }
    const propertiesData = JSON.parse(fs.readFileSync(propertiesPath, 'utf8'));
    const properties = propertiesData.properties || [];

    // 3. قراءة بيانات المستخدمين
    let users: any[] = [];
    if (fs.existsSync(usersPath)) {
      const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
      users = usersData.users || [];
    }

    // 4. البحث عن العقار
    const property = properties.find((p: any) => p.id === body.propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // 5. البحث عن الوحدة (إن وجدت)
    let unit = null;
    if (body.unitId && property.units) {
      unit = property.units.find((u: any) => u.id === body.unitId);
    }

    // 6. البحث عن المالك
    let owner = null;
    if (property.ownerId) {
      owner = users.find((u: any) => u.id === property.ownerId);
    }

    // 7. المستأجر (من البيانات المرسلة أو من قاعدة البيانات)
    let tenant = body.tenantData || null;
    if (body.tenantId) {
      const foundTenant = users.find((u: any) => u.id === body.tenantId);
      if (foundTenant) {
        tenant = {
          name: foundTenant.name || foundTenant.username,
          nameEn: foundTenant.nameEn,
          phone: foundTenant.phone,
          email: foundTenant.email,
          idNumber: foundTenant.idNumber || foundTenant.id,
          address: foundTenant.address
        };
      }
    }

    // 8. بناء كائن البيانات
    const templateData = {
      property: {
        id: property.id,
        titleAr: property.titleAr || property.title,
        address: property.address,
        buildingNumber: property.buildingNumber,
        plotNumber: property.plotNumber,
        serialNumber: property.serialNumber,
        area: property.area || unit?.area,
        usageType: property.usageType || property.category,
        neighborhood: property.neighborhood,
        city: property.city,
        wilayat: property.wilayat,
        facilities: property.features || property.amenities || []
      },
      unit: unit ? {
        unitNo: unit.unitNo || unit.unitNumber,
        type: unit.type,
        area: unit.area,
        floor: unit.floor,
        beds: unit.beds || unit.bedrooms,
        baths: unit.baths || unit.bathrooms,
        rentalPrice: unit.rentalPrice || unit.price
      } : undefined,
      owner: owner ? {
        name: owner.name || owner.username,
        nameEn: owner.nameEn,
        id: owner.id,
        idNumber: owner.idNumber || owner.id,
        phone: owner.phone,
        email: owner.email,
        address: owner.address
      } : {
        name: 'غير محدد',
        nameEn: 'Not specified',
        id: 'N/A',
        idNumber: 'N/A',
        phone: 'N/A',
        email: 'N/A',
        address: 'N/A'
      },
      tenant: tenant ? {
        name: tenant.name,
        nameEn: tenant.nameEn,
        id: tenant.idNumber || body.tenantId,
        idNumber: tenant.idNumber || body.tenantId,
        phone: tenant.phone,
        email: tenant.email,
        address: tenant.address
      } : {
        name: 'غير محدد',
        nameEn: 'Not specified',
        id: 'N/A',
        idNumber: 'N/A',
        phone: 'N/A',
        email: 'N/A',
        address: 'N/A'
      },
      contract: {
        startDate: body.contractData.startDate,
        endDate: body.contractData.endDate,
        duration: body.contractData.duration,
        monthlyRent: body.contractData.monthlyRent,
        deposit: body.contractData.deposit,
        currency: body.contractData.currency || 'OMR',
        paymentDay: body.contractData.paymentDay || 5,
        customTerms: body.contractData.customTerms
      },
      additional: {
        signingDate: new Date().toISOString()
      }
    };

    // 9. اختيار القالب
    let selectedTemplate = null;
    
    if (body.templateId) {
      // إذا تم تحديد قالب معين
      selectedTemplate = templates.find((t: any) => t.id === body.templateId);
    }
    
    if (!selectedTemplate) {
      // اختيار القالب تلقائياً
      selectedTemplate = selectBestTemplate(templates, templateData);
    }

    if (!selectedTemplate) {
      // استخدام القالب الافتراضي
      selectedTemplate = templates.find((t: any) => t.isDefault) || templates[0];
    }

    if (!selectedTemplate) {
      return res.status(404).json({ error: 'No suitable template found' });
    }

    // 10. ملء القالب
    const filledTemplate = fillTemplate(selectedTemplate, templateData);

    // 11. إرجاع النتيجة
    return res.status(200).json({
      success: true,
      template: filledTemplate,
      data: templateData
    });

  } catch (error: any) {
    console.error('Error generating filled template:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}

