// API لجلب الوحدات مع بيانات المستأجرين
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Unit {
  id: string;
  unitNumber: string;
  buildingId: string;
  buildingName: string;
  floor?: number;
  currentTenant?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    contractNumber?: string;
    contractStartDate?: string;
    contractEndDate?: string;
    monthlyRent?: number;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // قراءة بيانات الوحدات
      const dataPath = path.join(process.cwd(), '.data', 'units.json');
      
      let units: Unit[] = [];
      if (fs.existsSync(dataPath)) {
        const fileData = fs.readFileSync(dataPath, 'utf-8');
        units = JSON.parse(fileData);
      }

      // إضافة بيانات وهمية إذا لم توجد بيانات
      if (units.length === 0) {
        units = [
          {
            id: 'U001',
            unitNumber: 'A-101',
            buildingId: 'B001',
            buildingName: 'برج المجد',
            floor: 1,
            currentTenant: {
              id: 'T001',
              name: 'أحمد المحمودي',
              phone: '96891234567',
              email: 'ahmed@example.com',
              contractNumber: 'C-2025-001',
              contractStartDate: '2025-01-01',
              contractEndDate: '2025-12-31',
              monthlyRent: 300
            }
          },
          {
            id: 'U002',
            unitNumber: 'A-102',
            buildingId: 'B001',
            buildingName: 'برج المجد',
            floor: 1,
            currentTenant: {
              id: 'T002',
              name: 'فاطمة البلوشي',
              phone: '96898765432',
              email: 'fatima@example.com',
              contractNumber: 'C-2025-002',
              contractStartDate: '2025-02-01',
              contractEndDate: '2026-01-31',
              monthlyRent: 350
            }
          },
          {
            id: 'U003',
            unitNumber: 'B-201',
            buildingId: 'B002',
            buildingName: 'مجمع النور',
            floor: 2,
            currentTenant: {
              id: 'T003',
              name: 'سعيد الهنائي',
              phone: '96895551234',
              email: 'saeed@example.com',
              contractNumber: 'C-2025-003',
              contractStartDate: '2025-03-01',
              contractEndDate: '2026-02-28',
              monthlyRent: 400
            }
          },
          {
            id: 'U004',
            unitNumber: 'B-202',
            buildingId: 'B002',
            buildingName: 'مجمع النور',
            floor: 2
            // وحدة فارغة (لا يوجد مستأجر)
          }
        ];
      }

      return res.status(200).json({ success: true, units });
    } catch (error) {
      console.error('Error fetching units:', error);
      return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
    }
  }

  if (req.method === 'POST') {
    try {
      const unitData = req.body;
      
      // حفظ البيانات (يمكن تطويرها لاحقاً)
      const dataPath = path.join(process.cwd(), '.data', 'units.json');
      const dirPath = path.join(process.cwd(), '.data');
      
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      let units: Unit[] = [];
      if (fs.existsSync(dataPath)) {
        const fileData = fs.readFileSync(dataPath, 'utf-8');
        units = JSON.parse(fileData);
      }

      units.push({
        ...unitData,
        id: `U${String(units.length + 1).padStart(3, '0')}`
      });

      fs.writeFileSync(dataPath, JSON.stringify(units, null, 2));

      return res.status(201).json({ success: true, message: 'تم إضافة الوحدة بنجاح' });
    } catch (error) {
      console.error('Error creating unit:', error);
      return res.status(500).json({ success: false, message: 'خطأ في إضافة الوحدة' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

