// src/pages/api/settings/user.ts - API إعدادات المستخدم
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface UserSettings {
  id: string;
  userId: string;
  profile: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    bio?: string;
    location?: string;
    timezone: string;
    language: string;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
    security: boolean;
    maintenance: boolean;
    bookings: boolean;
    payments: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
    allowMessages: boolean;
    dataSharing: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    loginAlerts: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
    allowedIPs: string[];
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    fontSize: 'small' | 'medium' | 'large';
    language: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
  };
  preferences: {
    defaultView: 'grid' | 'list';
    itemsPerPage: number;
    autoSave: boolean;
    showTutorials: boolean;
    compactMode: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const USER_SETTINGS_FILE = path.join(DATA_DIR, 'user-settings.json');

// قراءة إعدادات المستخدم
const readUserSettings = (): UserSettings[] => {
  try {
    if (fs.existsSync(USER_SETTINGS_FILE)) {
      const data = fs.readFileSync(USER_SETTINGS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading user settings:', error);
  }
  return [];
};

// كتابة إعدادات المستخدم
const writeUserSettings = (settings: UserSettings[]): void => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USER_SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Error writing user settings:', error);
    throw error;
  }
};

// إنشاء إعدادات جديدة
const createUserSettings = (userId: string): UserSettings => {
  const now = new Date().toISOString();
  const id = `SETTINGS-${Date.now()}`;
  
  return {
    id,
    userId,
    profile: {
      name: 'مستخدم جديد',
      email: 'user@example.com',
      phone: '+968 0000 0000',
      avatar: '',
      bio: '',
      location: 'مسقط، عُمان',
      timezone: 'Asia/Muscat',
      language: 'ar'
    },
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: false,
      security: true,
      maintenance: true,
      bookings: true,
      payments: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      showLocation: true,
      allowMessages: true,
      dataSharing: false
    },
    security: {
      twoFactorAuth: false,
      loginAlerts: true,
      sessionTimeout: 30,
      passwordExpiry: 90,
      allowedIPs: []
    },
    appearance: {
      theme: 'light',
      primaryColor: 'blue',
      fontSize: 'medium',
      language: 'ar',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h'
    },
    preferences: {
      defaultView: 'grid',
      itemsPerPage: 25,
      autoSave: true,
      showTutorials: true,
      compactMode: false
    },
    createdAt: now,
    updatedAt: now
  };
};

// إنشاء بيانات تجريبية لإعدادات المستخدم
const createSampleUserSettings = (): UserSettings => {
  const now = new Date();
  return {
    id: 'SETTINGS-001',
    userId: 'USER-001',
    profile: {
      name: 'أحمد محمد العبري',
      email: 'ahmed.albri@example.com',
      phone: '+968 1234 5678',
      avatar: '/avatars/ahmed.jpg',
      bio: 'مطور عقاري متخصص في إدارة العقارات والتطوير العقاري',
      location: 'مسقط، سلطنة عُمان',
      timezone: 'Asia/Muscat',
      language: 'ar'
    },
    notifications: {
      email: true,
      sms: true,
      push: true,
      marketing: false,
      security: true,
      maintenance: true,
      bookings: true,
      payments: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: true,
      showLocation: true,
      allowMessages: true,
      dataSharing: false
    },
    security: {
      twoFactorAuth: true,
      loginAlerts: true,
      sessionTimeout: 60,
      passwordExpiry: 90,
      allowedIPs: ['192.168.1.100', '10.0.0.50']
    },
    appearance: {
      theme: 'light',
      primaryColor: 'blue',
      fontSize: 'medium',
      language: 'ar',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h'
    },
    preferences: {
      defaultView: 'grid',
      itemsPerPage: 25,
      autoSave: true,
      showTutorials: false,
      compactMode: false
    },
    createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
  };
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        // قراءة إعدادات المستخدم
        let userSettings = readUserSettings();
        
        // إنشاء بيانات تجريبية إذا لم تكن موجودة
        if (userSettings.length === 0) {
          const sampleSettings = createSampleUserSettings();
          userSettings = [sampleSettings];
          writeUserSettings(userSettings);
        }

        const { userId = 'USER-001' } = req.query;

        // البحث عن إعدادات المستخدم
        let settings = userSettings.find(s => s.userId === userId);

        if (!settings) {
          // إنشاء إعدادات جديدة للمستخدم
          settings = createUserSettings(userId as string);
          userSettings.push(settings);
          writeUserSettings(userSettings);
        }

        res.status(200).json({
          settings,
          userId: userId as string
        });
        break;
      }

      case 'POST': {
        // إنشاء إعدادات جديدة
        const { userId: newUserId } = req.body;

        if (!newUserId) {
          return res.status(400).json({
            error: 'Missing required field: userId'
          });
        }

        // التحقق من وجود إعدادات للمستخدم
        const existingSettings = readUserSettings();
        const existingUserSettings = existingSettings.find(s => s.userId === newUserId);

        if (existingUserSettings) {
          return res.status(400).json({
            error: 'User settings already exist'
          });
        }

        const newSettings = createUserSettings(newUserId);
        const allSettingsList = [...existingSettings, newSettings];
        writeUserSettings(allSettingsList);

        res.status(201).json({
          message: 'User settings created successfully',
          settings: newSettings
        });
        break;
      }

      case 'PUT': {
        // تحديث إعدادات المستخدم
        const { id, ...updateData } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'Settings ID is required' });
        }

        const allSettings = readUserSettings();
        const settingsIndex = allSettings.findIndex(s => s.id === id);

        if (settingsIndex === -1) {
          return res.status(404).json({ error: 'Settings not found' });
        }

        const updatedSettings = {
          ...allSettings[settingsIndex],
          ...updateData,
          updatedAt: new Date().toISOString()
        };

        allSettings[settingsIndex] = updatedSettings;
        writeUserSettings(allSettings);

        res.status(200).json({
          message: 'Settings updated successfully',
          settings: updatedSettings
        });
        break;
      }

      case 'DELETE': {
        // حذف إعدادات المستخدم
        const { id: deleteId } = req.query;

        if (!deleteId) {
          return res.status(400).json({ error: 'Settings ID is required' });
        }

        const settingsToDelete = readUserSettings();
        const deleteIndex = settingsToDelete.findIndex(s => s.id === deleteId);

        if (deleteIndex === -1) {
          return res.status(404).json({ error: 'Settings not found' });
        }

        settingsToDelete.splice(deleteIndex, 1);
        writeUserSettings(settingsToDelete);

        res.status(200).json({
          message: 'Settings deleted successfully'
        });
        break;
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Error in user settings API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
