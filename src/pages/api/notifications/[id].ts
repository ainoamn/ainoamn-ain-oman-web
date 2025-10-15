import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const notificationsPath = path.join(process.cwd(), '.data', 'notifications.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    const fileData = fs.readFileSync(notificationsPath, 'utf8');
    const data = JSON.parse(fileData);

    if (req.method === 'PUT' || req.method === 'PATCH') {
      // تحديث إشعار
      const notificationIndex = data.notifications.findIndex((n: any) => n.id === id);

      if (notificationIndex === -1) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      // تحديث البيانات
      data.notifications[notificationIndex] = {
        ...data.notifications[notificationIndex],
        ...req.body,
        updatedAt: new Date().toISOString()
      };

      fs.writeFileSync(notificationsPath, JSON.stringify(data, null, 2), 'utf8');

      res.status(200).json({
        success: true,
        notification: data.notifications[notificationIndex]
      });

    } else if (req.method === 'DELETE') {
      // حذف إشعار
      const notificationIndex = data.notifications.findIndex((n: any) => n.id === id);

      if (notificationIndex === -1) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      data.notifications.splice(notificationIndex, 1);
      fs.writeFileSync(notificationsPath, JSON.stringify(data, null, 2), 'utf8');

      res.status(200).json({
        success: true,
        message: 'Notification deleted'
      });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Error in /api/notifications/[id]:', error);
    res.status(500).json({ 
      error: 'Failed to process notification',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
