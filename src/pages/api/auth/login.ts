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

    // قراءة الحسابات التجريبية
    const demoUsersPath = path.join(process.cwd(), '.data', 'demo-users.json');
    const allAccountsPath = path.join(process.cwd(), '.data', 'all-demo-accounts.json');
    
    let users: any[] = [];
    
    // محاولة قراءة من demo-users أولاً
    if (fs.existsSync(demoUsersPath)) {
      const demoData = JSON.parse(fs.readFileSync(demoUsersPath, 'utf8'));
      users = Array.isArray(demoData) ? demoData : [];
    }
    
    // إذا لم توجد، جرب all-demo-accounts
    if (users.length === 0 && fs.existsSync(allAccountsPath)) {
      const allData = JSON.parse(fs.readFileSync(allAccountsPath, 'utf8'));
      users = Array.isArray(allData) ? allData : [];
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
      picture: user.picture || '/demo/user1.jpg',
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

