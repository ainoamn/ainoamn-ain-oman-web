// FILE: /src/pages/api/tasks/index.ts
import { getNextSequenceNumber } from '@/server/serialNumbers';

// في دالة POST لإنشاء مهمة جديدة:
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const taskData = req.body;
      const serialNumber = await getNextSequenceNumber();
      
      const task = {
        ...taskData,
        id: serialNumber,
        serial: serialNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // حفظ المهمة...
      
      res.status(201).json({ ok: true, task });
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Failed to create task' });
    }
  }
  
  // معالجة الطلبات الأخرى...
}