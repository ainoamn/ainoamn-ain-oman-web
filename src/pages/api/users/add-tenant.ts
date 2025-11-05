// src/pages/api/users/add-tenant.ts - إضافة مستأجر جديد
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, idNumber, address } = req.body;

    // التحقق من الحقول المطلوبة
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // قراءة ملف المستخدمين
    const usersPath = path.join(process.cwd(), '.data', 'users.json');
    const usersData = fs.readFileSync(usersPath, 'utf-8');
    const users = JSON.parse(usersData);

    // التحقق من عدم وجود المستخدم بنفس البريد الإلكتروني
    const existingUser = users.find((u: any) => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // إنشاء ID جديد للمستأجر
    const tenantCount = users.filter((u: any) => u.role === 'tenant').length;
    const newTenantId = `TENANT-${String(tenantCount + 1).padStart(3, '0')}`;

    // إنشاء المستأجر الجديد
    const newTenant = {
      id: newTenantId,
      name,
      email,
      password: `Tenant@${new Date().getFullYear()}`, // كلمة مرور افتراضية
      phone,
      role: 'tenant',
      status: 'active',
      isVerified: false,
      permissions: [],
      profile: {
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=14b8a6&color=fff&size=200`,
        company: '',
        location: address || '',
        idNumber: idNumber || '',
        lastLogin: new Date().toISOString(),
        loginCount: 0
      },
      subscription: {
        plan: 'basic',
        planName: 'الخطة المجانية',
        status: 'active',
        expiresAt: '2099-12-31T23:59:59.999Z',
        remainingDays: 99999
      },
      stats: {
        properties: 0,
        units: 0,
        bookings: 0,
        revenue: 0,
        tasks: 0,
        legalCases: 0
      },
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    // إضافة المستأجر للمصفوفة
    users.push(newTenant);

    // حفظ الملف
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');

    res.status(200).json(newTenant);
  } catch (error) {
    console.error('Error adding tenant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

