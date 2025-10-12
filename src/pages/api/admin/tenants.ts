// API لجلب المستأجرين
import type { NextApiRequest, NextApiResponse } from 'next';

interface Tenant {
  id: string;
  name: string;
  phone: string;
  email?: string;
  nationalId?: string;
  status: 'active' | 'inactive';
  currentUnit?: {
    unitId: string;
    unitNumber: string;
    buildingId: string;
    buildingName: string;
    contractNumber: string;
    contractStartDate: string;
    contractEndDate: string;
    monthlyRent: number;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // بيانات المستأجرين الوهمية
      const tenants: Tenant[] = [
        {
          id: 'T001',
          name: 'أحمد المحمودي',
          phone: '96891234567',
          email: 'ahmed@example.com',
          nationalId: '12345678',
          status: 'active',
          currentUnit: {
            unitId: 'U001',
            unitNumber: 'A-101',
            buildingId: 'B001',
            buildingName: 'برج المجد',
            contractNumber: 'C-2025-001',
            contractStartDate: '2025-01-01',
            contractEndDate: '2025-12-31',
            monthlyRent: 300
          }
        },
        {
          id: 'T002',
          name: 'فاطمة البلوشي',
          phone: '96898765432',
          email: 'fatima@example.com',
          nationalId: '87654321',
          status: 'active',
          currentUnit: {
            unitId: 'U002',
            unitNumber: 'A-102',
            buildingId: 'B001',
            buildingName: 'برج المجد',
            contractNumber: 'C-2025-002',
            contractStartDate: '2025-02-01',
            contractEndDate: '2026-01-31',
            monthlyRent: 350
          }
        },
        {
          id: 'T003',
          name: 'سعيد الهنائي',
          phone: '96895551234',
          email: 'saeed@example.com',
          nationalId: '45678912',
          status: 'active',
          currentUnit: {
            unitId: 'U003',
            unitNumber: 'B-201',
            buildingId: 'B002',
            buildingName: 'مجمع النور',
            contractNumber: 'C-2025-003',
            contractStartDate: '2025-03-01',
            contractEndDate: '2026-02-28',
            monthlyRent: 400
          }
        },
        {
          id: 'T004',
          name: 'مريم الشكيلي',
          phone: '96892221111',
          email: 'mariam@example.com',
          nationalId: '99988877',
          status: 'inactive'
          // مستأجر سابق (لا توجد وحدة حالية)
        }
      ];

      return res.status(200).json({ success: true, tenants });
    } catch (error) {
      console.error('Error fetching tenants:', error);
      return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

