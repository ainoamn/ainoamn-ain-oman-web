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
  contractType?: 'residential' | 'commercial'; // نوع العقد
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

    // 9. اختيار القالب الذكي
    let selectedTemplate = null;
    
    console.log('🔍 اختيار القالب الذكي...');
    console.log('📋 نوع العقد:', body.contractType);
    console.log('🏢 نوع الاستخدام:', property.usageType || property.category);
    
    // 1. أولوية عالية: قالب مخصص مرتبط بالعقار أو الوحدة
    if (body.unitId) {
      selectedTemplate = templates.find((t: any) => 
        t.linkedUnits?.includes(body.unitId)
      );
      if (selectedTemplate) {
        console.log('✅ تم اختيار قالب مخصص مرتبط بالوحدة:', selectedTemplate.name);
      }
    }
    
    if (!selectedTemplate && body.propertyId) {
      selectedTemplate = templates.find((t: any) => 
        t.linkedProperties?.includes(body.propertyId)
      );
      if (selectedTemplate) {
        console.log('✅ تم اختيار قالب مخصص مرتبط بالعقار:', selectedTemplate.name);
      }
    }
    
    // 2. إذا تم تحديد templateId صراحة
    if (!selectedTemplate && body.templateId) {
      selectedTemplate = templates.find((t: any) => t.id === body.templateId);
      if (selectedTemplate) {
        console.log('✅ تم اختيار القالب المحدد:', selectedTemplate.name);
      }
    }
    
    // 3. اختيار حسب نوع العقد (سكني/تجاري)
    if (!selectedTemplate && body.contractType) {
      const usageType = body.contractType === 'residential' ? 'residential' : 'commercial';
      selectedTemplate = templates.find((t: any) => 
        t.type === 'rental' && 
        t.usageTypes?.includes(usageType)
      );
      if (selectedTemplate) {
        console.log('✅ تم اختيار قالب حسب نوع العقد:', body.contractType);
      }
    }
    
    // 4. اختيار حسب usageType من العقار
    if (!selectedTemplate && (property.usageType || property.category)) {
      const usageType = property.usageType || property.category;
      selectedTemplate = templates.find((t: any) => 
        t.type === 'rental' && 
        t.usageTypes?.includes(usageType)
      );
      if (selectedTemplate) {
        console.log('✅ تم اختيار قالب حسب نوع استخدام العقار:', usageType);
      }
    }
    
    // 5. استخدام دالة الاختيار الذكي
    if (!selectedTemplate) {
      selectedTemplate = selectBestTemplate(templates, templateData);
      if (selectedTemplate) {
        console.log('✅ تم اختيار قالب عبر الاختيار الذكي');
      }
    }
    
    // 6. استخدام القالب الافتراضي
    if (!selectedTemplate) {
      selectedTemplate = templates.find((t: any) => t.isDefault) || templates[0];
      if (selectedTemplate) {
        console.log('⚠️ استخدام القالب الافتراضي');
      }
    }

    if (!selectedTemplate) {
      console.error('❌ لم يتم العثور على أي قالب مناسب');
      return res.status(404).json({ error: 'No suitable template found' });
    }
    
    console.log('🎉 القالب المختار:', selectedTemplate.id, '-', selectedTemplate.name);

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

