// src/pages/api/users/permissions.ts - API لإدارة صلاحيات المستخدمين الفردية
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  permissions: string[];
  [key: string]: any;
}

function loadUsers(): User[] {
  try {
    const usersPath = path.join(process.cwd(), '.data', 'users.json');
    if (fs.existsSync(usersPath)) {
      const usersData = fs.readFileSync(usersPath, 'utf8');
      return JSON.parse(usersData);
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
  return [];
}

function saveUsers(users: User[]): void {
  try {
    const usersPath = path.join(process.cwd(), '.data', 'users.json');
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving users:', error);
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, permissions } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'معرف المستخدم مطلوب' });
    }

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ error: 'الصلاحيات يجب أن تكون مصفوفة' });
    }

    // تحميل المستخدمين
    const users = loadUsers();
    
    // البحث عن المستخدم
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    // تحديث صلاحيات المستخدم
    users[userIndex].permissions = permissions;
    
    // حفظ التغييرات
    saveUsers(users);

    return res.status(200).json({
      success: true,
      message: 'تم تحديث الصلاحيات بنجاح',
      user: {
        id: users[userIndex].id,
        name: users[userIndex].name,
        email: users[userIndex].email,
        permissions: users[userIndex].permissions
      }
    });

  } catch (error) {
    console.error('Error in permissions API:', error);
    return res.status(500).json({ 
      error: 'خطأ في الخادم',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    });
  }
}

