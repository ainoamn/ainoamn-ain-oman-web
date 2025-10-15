import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const notificationsPath = path.join(process.cwd(), '.data', 'notifications.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // قراءة ملف الإشعارات
    const fileData = fs.readFileSync(notificationsPath, 'utf8');
    const data = JSON.parse(fileData);

    if (req.method === 'GET') {
      // GET - جلب الإشعارات
      const { userId, unreadOnly } = req.query;

      let notifications = data.notifications || [];

      // فلترة حسب المستخدم
      if (userId) {
        notifications = notifications.filter((n: any) => n.userId === userId);
      }

      // فلترة غير المقروءة فقط
      if (unreadOnly === 'true') {
        notifications = notifications.filter((n: any) => !n.read);
      }

      // ترتيب حسب التاريخ (الأحدث أولاً)
      notifications.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      res.status(200).json({
        success: true,
        notifications,
        count: notifications.length,
        unreadCount: notifications.filter((n: any) => !n.read).length
      });

    } else if (req.method === 'POST') {
      // POST - إضافة إشعار جديد
      const newNotification = {
        id: `notif_${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString(),
        read: false
      };

      data.notifications = data.notifications || [];
      data.notifications.push(newNotification);

      fs.writeFileSync(notificationsPath, JSON.stringify(data, null, 2), 'utf8');

      res.status(201).json({
        success: true,
        notification: newNotification
      });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Error in /api/notifications:', error);
    res.status(500).json({ 
      error: 'Failed to process notifications',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
