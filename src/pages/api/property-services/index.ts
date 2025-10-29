// src/pages/api/property-services/index.ts - API لإدارة خدمات العقارات
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface PropertyService {
  id: string;
  propertyId: string;
  unitId?: string | null;
  ownerId: string;
  tenantId?: string | null;
  serviceType: string;
  serviceName: string;
  accountNumber: string;
  provider: string;
  providerContact?: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'suspended' | 'terminated';
  monthlyAmount: number;
  currency: string;
  isOverdue: boolean;
  lastPaymentDate: string;
  nextDueDate: string;
  overdueAmount: number;
  notes?: string;
  isReimbursable: boolean;
  createdAt: string;
  updatedAt: string;
}

const dataFilePath = path.join(process.cwd(), '.data', 'property-services.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // قراءة البيانات من الملف
    const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    let services: PropertyService[] = data.services || [];

    if (req.method === 'GET') {
      const { propertyId, unitId, ownerId, tenantId, serviceType, status, overdue } = req.query;

      // فلترة الخدمات حسب المعايير
      let filteredServices = services;

      if (propertyId) {
        filteredServices = filteredServices.filter(service => service.propertyId === propertyId);
      }

      if (unitId) {
        filteredServices = filteredServices.filter(service => service.unitId === unitId);
      }

      if (ownerId) {
        filteredServices = filteredServices.filter(service => service.ownerId === ownerId);
      }

      if (tenantId) {
        filteredServices = filteredServices.filter(service => service.tenantId === tenantId);
      }

      if (serviceType) {
        filteredServices = filteredServices.filter(service => service.serviceType === serviceType);
      }

      if (status) {
        filteredServices = filteredServices.filter(service => service.status === status);
      }

      if (overdue === 'true') {
        filteredServices = filteredServices.filter(service => service.isOverdue);
      }

      return res.status(200).json({
        success: true,
        services: filteredServices,
        total: filteredServices.length
      });
    }

    if (req.method === 'POST') {
      const newService: PropertyService = {
        id: `SERV-${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      services.push(newService);

      // حفظ البيانات
      fs.writeFileSync(dataFilePath, JSON.stringify({ services }, null, 2));

      return res.status(201).json({
        success: true,
        service: newService,
        message: 'تم إضافة الخدمة بنجاح'
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });

  } catch (error) {
    console.error('Error in property-services API:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'خطأ في الخادم',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
