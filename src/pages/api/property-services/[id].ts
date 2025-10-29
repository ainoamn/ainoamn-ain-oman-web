// src/pages/api/property-services/[id].ts - API لإدارة خدمة معينة
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
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: 'Service ID is required' });
    }

    // قراءة البيانات من الملف
    const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    let services: PropertyService[] = data.services || [];

    const serviceIndex = services.findIndex(service => service.id === id);

    if (serviceIndex === -1) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        service: services[serviceIndex]
      });
    }

    if (req.method === 'PUT') {
      const updatedService = {
        ...services[serviceIndex],
        ...req.body,
        id, // التأكد من عدم تغيير الـ ID
        updatedAt: new Date().toISOString()
      };

      services[serviceIndex] = updatedService;

      // حفظ البيانات
      fs.writeFileSync(dataFilePath, JSON.stringify({ services }, null, 2));

      return res.status(200).json({
        success: true,
        service: updatedService,
        message: 'تم تحديث الخدمة بنجاح'
      });
    }

    if (req.method === 'DELETE') {
      services.splice(serviceIndex, 1);

      // حفظ البيانات
      fs.writeFileSync(dataFilePath, JSON.stringify({ services }, null, 2));

      return res.status(200).json({
        success: true,
        message: 'تم حذف الخدمة بنجاح'
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });

  } catch (error) {
    console.error('Error in property-services/[id] API:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'خطأ في الخادم',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
