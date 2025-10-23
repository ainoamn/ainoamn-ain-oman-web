// src/pages/api/user/notifications.ts - إشعارات المستخدم
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const NOTIFICATIONS_FILE = path.join(process.cwd(), 'data', 'notifications.json');

function readNotifications(): any[] {
  try {
    if (fs.existsSync(NOTIFICATIONS_FILE)) {
      const data = fs.readFileSync(NOTIFICATIONS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading notifications:', error);
  }
  return [];
}

function writeNotifications(notifications: any[]): void {
  try {
    const dir = path.dirname(NOTIFICATIONS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2));
  } catch (error) {
    console.error('Error writing notifications:', error);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      case 'PATCH':
        return handlePatch(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { limit = 20, unreadOnly = false } = req.query;
  
  let notifications = readNotifications();
  
  // تصفية الإشعارات حسب المستخدم
  notifications = notifications.filter(notification => notification.userId === userId);
  
  // تصفية الإشعارات غير المقروءة فقط إذا طُلب ذلك
  if (unreadOnly === 'true') {
    notifications = notifications.filter(notification => !notification.read);
  }
  
  // ترتيب حسب التاريخ (الأحدث أولاً)
  notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // تحديد العدد المطلوب
  const limitNum = parseInt(limit as string);
  notifications = notifications.slice(0, limitNum);

  return res.status(200).json({
    success: true,
    notifications
  });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { title, message, type = 'info', userId: targetUserId } = req.body;

  if (!title || !message || !targetUserId) {
    return res.status(400).json({
      error: 'Missing required fields: title, message, userId'
    });
  }

  const notifications = readNotifications();
  
  const newNotification = {
    id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: targetUserId,
    title,
    message,
    type,
    read: false,
    timestamp: new Date().toISOString()
  };

  notifications.push(newNotification);
  writeNotifications(notifications);

  return res.status(201).json({
    success: true,
    notification: newNotification
  });
}

async function handlePatch(req: NextApiRequest, res: NextApiResponse) {
  const { notificationId, read } = req.body;

  if (!notificationId) {
    return res.status(400).json({ error: 'Notification ID is required' });
  }

  const notifications = readNotifications();
  const notificationIndex = notifications.findIndex(n => n.id === notificationId && n.userId === userId);

  if (notificationIndex === -1) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  // تحديث حالة القراءة
  if (read !== undefined) {
    notifications[notificationIndex].read = read;
  }

  writeNotifications(notifications);

  return res.status(200).json({
    success: true,
    notification: notifications[notificationIndex]
  });
}
