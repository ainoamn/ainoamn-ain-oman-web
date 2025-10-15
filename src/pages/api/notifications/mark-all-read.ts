import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const notificationsPath = path.join(process.cwd(), '.data', 'notifications.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    const fileData = fs.readFileSync(notificationsPath, 'utf8');
    const data = JSON.parse(fileData);

    // تحديث جميع إشعارات المستخدم كمقروءة
    data.notifications = data.notifications.map((n: any) => {
      if (n.userId === userId && !n.read) {
        return {
          ...n,
          read: true,
          readAt: new Date().toISOString()
        };
      }
      return n;
    });

    fs.writeFileSync(notificationsPath, JSON.stringify(data, null, 2), 'utf8');

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Error in /api/notifications/mark-all-read:', error);
    res.status(500).json({ 
      error: 'Failed to mark notifications as read',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

