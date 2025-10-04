// src/pages/api/settings/notifications.ts - API إعدادات الإشعارات
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface NotificationSettings {
  id: string;
  userId: string;
  type: string;
  enabled: boolean;
  channels: string[];
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const NOTIFICATION_SETTINGS_FILE = path.join(DATA_DIR, 'notification-settings.json');

// قراءة إعدادات الإشعارات
const readNotificationSettings = (): NotificationSettings[] => {
  try {
    if (fs.existsSync(NOTIFICATION_SETTINGS_FILE)) {
      const data = fs.readFileSync(NOTIFICATION_SETTINGS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading notification settings:', error);
  }
  return [];
};

// كتابة إعدادات الإشعارات
const writeNotificationSettings = (settings: NotificationSettings[]): void => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(NOTIFICATION_SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Error writing notification settings:', error);
    throw error;
  }
};

// إنشاء إعدادات إشعارات جديدة
const createNotificationSettings = (userId: string, type: string): NotificationSettings => {
  const now = new Date().toISOString();
  const id = `NOTIF-${Date.now()}`;
  
  return {
    id,
    userId,
    type,
    enabled: true,
    channels: ['email', 'push'],
    frequency: 'immediate',
    createdAt: now,
    updatedAt: now
  };
};

// إنشاء بيانات تجريبية لإعدادات الإشعارات
const createSampleNotificationSettings = (): NotificationSettings[] => {
  const now = new Date();
  const sampleSettings: NotificationSettings[] = [
    {
      id: 'NOTIF-001',
      userId: 'USER-001',
      type: 'booking_confirmation',
      enabled: true,
      channels: ['email', 'push'],
      frequency: 'immediate',
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'NOTIF-002',
      userId: 'USER-001',
      type: 'payment_reminder',
      enabled: true,
      channels: ['email', 'sms'],
      frequency: 'daily',
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'NOTIF-003',
      userId: 'USER-001',
      type: 'maintenance_request',
      enabled: true,
      channels: ['email', 'push'],
      frequency: 'immediate',
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'NOTIF-004',
      userId: 'USER-001',
      type: 'task_assignment',
      enabled: true,
      channels: ['email', 'push'],
      frequency: 'immediate',
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'NOTIF-005',
      userId: 'USER-001',
      type: 'auction_update',
      enabled: true,
      channels: ['email', 'push'],
      frequency: 'immediate',
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'NOTIF-006',
      userId: 'USER-001',
      type: 'security_alert',
      enabled: true,
      channels: ['email', 'sms', 'push'],
      frequency: 'immediate',
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'NOTIF-007',
      userId: 'USER-001',
      type: 'marketing_newsletter',
      enabled: false,
      channels: ['email'],
      frequency: 'weekly',
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'NOTIF-008',
      userId: 'USER-001',
      type: 'system_maintenance',
      enabled: true,
      channels: ['email', 'push'],
      frequency: 'immediate',
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  return sampleSettings;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // قراءة إعدادات الإشعارات
        let notificationSettings = readNotificationSettings();
        
        // إنشاء بيانات تجريبية إذا لم تكن موجودة
        if (notificationSettings.length === 0) {
          notificationSettings = createSampleNotificationSettings();
          writeNotificationSettings(notificationSettings);
        }

        const { userId = 'USER-001', type } = req.query;

        // تطبيق الفلاتر
        let filteredSettings = [...notificationSettings];

        if (userId) {
          filteredSettings = filteredSettings.filter(s => s.userId === userId);
        }

        if (type) {
          filteredSettings = filteredSettings.filter(s => s.type === type);
        }

        res.status(200).json({
          notifications: filteredSettings,
          total: filteredSettings.length,
          filters: {
            userId,
            type
          }
        });
        break;

      case 'POST':
        // إنشاء إعدادات إشعارات جديدة
        const { 
          userId: newUserId, 
          type: newType, 
          enabled = true, 
          channels = ['email'], 
          frequency = 'immediate' 
        } = req.body;

        if (!newUserId || !newType) {
          return res.status(400).json({
            error: 'Missing required fields: userId, type'
          });
        }

        // التحقق من وجود إعدادات للمستخدم والنوع
        const existingSettings = readNotificationSettings();
        const existingUserSettings = existingSettings.find(s => 
          s.userId === newUserId && s.type === newType
        );

        if (existingUserSettings) {
          return res.status(400).json({
            error: 'Notification settings already exist for this user and type'
          });
        }

        const newSettings = createNotificationSettings(newUserId, newType);
        newSettings.enabled = enabled;
        newSettings.channels = channels;
        newSettings.frequency = frequency;

        const updatedSettings = [...existingSettings, newSettings];
        writeNotificationSettings(updatedSettings);

        res.status(201).json({
          message: 'Notification settings created successfully',
          notification: newSettings
        });
        break;

      case 'PUT':
        // تحديث إعدادات الإشعارات
        const { id, ...updateData } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'Notification settings ID is required' });
        }

        const allSettings = readNotificationSettings();
        const settingsIndex = allSettings.findIndex(s => s.id === id);

        if (settingsIndex === -1) {
          return res.status(404).json({ error: 'Notification settings not found' });
        }

        const updatedSettings = {
          ...allSettings[settingsIndex],
          ...updateData,
          updatedAt: new Date().toISOString()
        };

        allSettings[settingsIndex] = updatedSettings;
        writeNotificationSettings(allSettings);

        res.status(200).json({
          message: 'Notification settings updated successfully',
          notification: updatedSettings
        });
        break;

      case 'DELETE':
        // حذف إعدادات الإشعارات
        const { id: deleteId } = req.query;

        if (!deleteId) {
          return res.status(400).json({ error: 'Notification settings ID is required' });
        }

        const settingsToDelete = readNotificationSettings();
        const deleteIndex = settingsToDelete.findIndex(s => s.id === deleteId);

        if (deleteIndex === -1) {
          return res.status(404).json({ error: 'Notification settings not found' });
        }

        settingsToDelete.splice(deleteIndex, 1);
        writeNotificationSettings(settingsToDelete);

        res.status(200).json({
          message: 'Notification settings deleted successfully'
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Error in notification settings API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
