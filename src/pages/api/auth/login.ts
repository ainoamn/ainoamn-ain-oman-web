// src/pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
    }

    // قراءة المستخدمين من قاعدة البيانات الحقيقية
    const usersPath = path.join(process.cwd(), '.data', 'users.json');
    
    let users: any[] = [];
    
    if (fs.existsSync(usersPath)) {
      const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
      users = Array.isArray(usersData) ? usersData : [];
      
      // تحميل صلاحيات الأدوار وإضافتها للمستخدمين
      const rolesPath = path.join(process.cwd(), '.data', 'roles-config.json');
      if (fs.existsSync(rolesPath)) {
        const rolesData = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));
        const roles = Array.isArray(rolesData) ? rolesData : [];
        
        users = users.map((user: any) => {
          // إذا كان المستخدم ليس لديه صلاحيات مخصصة، استخدم صلاحيات الدور
          if (!user.permissions || user.permissions.length === 0) {
            const userRole = roles.find((r: any) => r.id === user.role);
            if (userRole) {
              user.permissions = userRole.permissions;
            }
          }
          return user;
        });
      }
    }

    // البحث عن المستخدم
    const user = users.find((u: any) => u.email === email);

    if (!user) {
      return res.status(401).json({ error: 'البريد الإلكتروني غير صحيح' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
    }

    // نجح تسجيل الدخول
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      picture: user.picture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name) + '&background=6B7280&color=fff&size=200',
      isVerified: user.isVerified !== false,
      permissions: user.permissions || [],
      subscription: user.subscription || null
    };

    return res.status(200).json({
      success: true,
      user: userData,
      message: 'تم تسجيل الدخول بنجاح'
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء تسجيل الدخول' });
  }
}

