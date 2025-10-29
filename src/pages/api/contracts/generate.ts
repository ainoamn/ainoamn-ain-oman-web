import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

/**
 * API لتوليد عقد من قالب مع ملء البيانات تلقائياً
 */

interface ContractData {
  templateId: string;
  propertyId?: string;
  unitId?: string;
  tenantId?: string;
  landlordId?: string;
  contractData?: Record<string, any>;
  [key: string]: any;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { templateId, propertyId, unitId, tenantId, landlordId, contractData } = req.body as ContractData;

    if (!templateId) {
      return res.status(400).json({ error: 'Template ID is required' });
    }

    // قراءة القوالب
    const templatesPath = path.join(process.cwd(), '.data', 'contract-templates.json');
    const templatesData = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
    const template = templatesData.templates.find((t: any) => t.id === templateId);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // قراءة بيانات العقار إذا تم التوفير
    let property = null;
    if (propertyId) {
      const propertiesPath = path.join(process.cwd(), '.data', 'properties.json');
      const propertiesData = JSON.parse(fs.readFileSync(propertiesPath, 'utf8'));
      property = propertiesData.properties?.find((p: any) => p.id === propertyId) || 
                 propertiesData.find((p: any) => p.id === propertyId);
    }

    // قراءة بيانات الوحدة إذا تم التوفير
    let unit = null;
    if (unitId && property) {
      unit = property.units?.find((u: any) => u.id === unitId);
    }

    // قراءة بيانات المستأجر إذا تم التوفير
    let tenant = null;
    if (tenantId) {
      const usersPath = path.join(process.cwd(), '.data', 'users.json');
      const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
      tenant = usersData.users?.find((u: any) => u.id === tenantId || u.email === tenantId) ||
               usersData.find((u: any) => u.id === tenantId || u.email === tenantId);
    }

    // قراءة بيانات المؤجر إذا تم التوفير
    let landlord = null;
    if (landlordId) {
      const usersPath = path.join(process.cwd(), '.data', 'users.json');
      const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
      landlord = usersData.users?.find((u: any) => u.id === landlordId || u.email === landlordId) ||
                 usersData.find((u: any) => u.id === landlordId || u.email === landlordId);
    }

    // توليد العقد مع ملء البيانات
    const generatedContract = generateContract(template, {
      property,
      unit,
      tenant,
      landlord,
      contractData: contractData || {}
    });

    return res.status(200).json({
      success: true,
      contract: generatedContract,
      template: {
        id: template.id,
        name: template.name
      }
    });

  } catch (error: any) {
    console.error('Contract generation error:', error);
    return res.status(500).json({
      error: 'Contract generation failed',
      message: error.message
    });
  }
}

function generateContract(template: any, data: any) {
  const { property, unit, tenant, landlord, contractData } = data;

  // إنشاء البيانات المطلوبة للاستبدال
  const replacements = {
    // بيانات المؤجر
    '[Owner Name]': landlord?.name || landlord?.fullName || '________________',
    '[Landlord Name]': landlord?.name || landlord?.fullName || '________________',
    '[Landlord ID]': landlord?.idNumber || landlord?.civilId || '________________',
    '[Landlord Address]': landlord?.address || '________________',
    
    // بيانات المستأجر
    '[Tenant Name]': tenant?.name || tenant?.fullName || '________________',
    '[Tenant ID]': tenant?.idNumber || tenant?.civilId || '________________',
    '[Tenant Address]': tenant?.address || '________________',
    '[Tenant Mobile]': tenant?.mobile || tenant?.phone || '________________',
    '[Tenant Email]': tenant?.email || '________________',
    '[CR Number]': tenant?.crNumber || contractData.crNumber || '________________',
    
    // بيانات العقار
    '[Property Address]': property?.address || property?.location?.address || '________________',
    '[Plot Number]': property?.plotNumber || property?.location?.plotNumber || '________________',
    '[Building Number]': property?.buildingNumber || property?.location?.buildingNumber || '________________',
    '[Area]': property?.area || unit?.area || '________________',
    '[Usage Type]': property?.usageType || property?.purpose || '________________',
    
    // بيانات الوحدة
    '[Unit Number]': unit?.unitNumber || unit?.serialNumber || '________________',
    '[Unit Type]': unit?.type || '________________',
    '[Floor]': unit?.floor || '________________',
    '[Electricity Account]': unit?.electricityAccount || property?.electricityAccount || '________________',
    '[Water Account]': unit?.waterAccount || property?.waterAccount || '________________',
    
    // بيانات العقد
    '[Contract Number]': contractData.contractNumber || generateContractNumber(),
    '[Start Date]': contractData.startDate || formatDate(new Date()),
    '[End Date]': contractData.endDate || '________________',
    '[Duration]': contractData.duration || '________________',
    '[Amount]': contractData.amount || contractData.rent || '________________',
    '[Monthly Rent]': contractData.monthlyRent || contractData.rent || '________________',
    '[Security Amount]': contractData.securityDeposit || '________________',
    '[Due Date]': contractData.dueDate || '01',
    '[Date]': formatDate(new Date()),
    
    // بيانات إضافية
    '[Facilities List]': contractData.facilities || '________________',
    '[Comments]': contractData.comments || '',
    '[Reason]': contractData.reason || '________________',
    '[Property Condition]': contractData.propertyCondition || '________________',
    '[Deposit Status]': contractData.depositStatus || '________________',
    '[Bills Status]': contractData.billsStatus || '________________',
    '[Duration]': contractData.duration || '12 months',
    '[Number]': contractData.numberOfOccupants || '________________'
  };

  // استبدال البيانات في القالب
  const filledContract = {
    ...template,
    content: {
      sections: template.content.sections.map((section: any) => ({
        ...section,
        clauses: section.clauses.map((clause: any) => ({
          ar: replacePlaceholders(clause.ar, replacements),
          en: replacePlaceholders(clause.en, replacements)
        }))
      }))
    },
    generatedAt: new Date().toISOString(),
    contractData: {
      propertyId: property?.id,
      unitId: unit?.id,
      tenantId: tenant?.id,
      landlordId: landlord?.id,
      ...contractData
    }
  };

  return filledContract;
}

function replacePlaceholders(text: string, replacements: Record<string, string>): string {
  if (!text) return '';
  
  let result = text;
  Object.keys(replacements).forEach(key => {
    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    result = result.replace(regex, replacements[key]);
  });
  
  return result;
}

function generateContractNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000);
  return `${year}${month}${day}${random}`;
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

