// src/pages/api/users/add-owner.ts - إضافة مالك جديد
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
    const { name, email, phone, nationalId, nationalIdExpiry } = req.body;
    
    // التحقق من الحقول الأساسية
    if (!name || !email || !nationalId) {
      return res.status(400).json({ error: 'الاسم، البريد، والرقم المدني مطلوبة' });
    }

    // قراءة ملف المستخدمين
    const usersPath = path.join(process.cwd(), '.data', 'users.json');
    const usersData = fs.readFileSync(usersPath, 'utf-8');
    const users = JSON.parse(usersData);

    // التحقق من عدم تكرار الرقم المدني للملاك
    const existingOwner = users.find((u: any) => {
      // البحث في role = owner أو في ownerDetails
      if (u.role === 'owner' && u.ownerDetails?.nationalId === nationalId) {
        return true;
      }
      // البحث في profile.nationalId أيضاً
      if (u.role === 'owner' && u.profile?.nationalId === nationalId) {
        return true;
      }
      return false;
    });
    
    if (existingOwner) {
      return res.status(400).json({ 
        error: `مالك موجود مسبقاً بنفس الرقم المدني: ${nationalId}`,
        existingOwner: {
          id: existingOwner.id,
          name: existingOwner.name,
          email: existingOwner.email
        }
      });
    }

    // إنشاء ID جديد للمالك
    const ownerCount = users.filter((u: any) => u.role === 'owner').length;
    const newOwnerId = `OWNER-${String(ownerCount + 1).padStart(3, '0')}`;
    
    // توليد اسم مستخدم بصيغة: O-XX12345678
    // O- + أول حرفين من الاسم (كابيتال) + الرقم المدني
    const generateUsername = (name: string, nationalId: string): string => {
      const names = name.trim().split(' ');
      const firstName = names[0] || 'OW';
      const firstTwoLetters = firstName.substring(0, 2).toUpperCase();
      const cleanNationalId = nationalId.replace(/[^0-9]/g, '');
      return `O-${firstTwoLetters}${cleanNationalId}`;
    };
    
    // توليد رقم سري قوي
    const generatePassword = (): string => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
      const numbers = '0123456789';
      const special = '@#$!';
      
      let password = '';
      password += chars[Math.floor(Math.random() * chars.length)].toUpperCase(); // حرف كبير
      password += chars[Math.floor(Math.random() * chars.length)].toLowerCase(); // حرف صغير
      password += numbers[Math.floor(Math.random() * numbers.length)]; // رقم
      password += special[Math.floor(Math.random() * special.length)]; // رمز
      
      // إكمال بـ 4 أحرف عشوائية
      for (let i = 0; i < 4; i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
      }
      
      // خلط الأحرف
      return password.split('').sort(() => Math.random() - 0.5).join('');
    };
    
    const username = generateUsername(name, nationalId);
    const autoPassword = generatePassword();

    // إنشاء المالك الجديد
    const newOwner = {
      id: newOwnerId,
      name,
      email,
      username, // اسم المستخدم المولد تلقائياً
      password: autoPassword, // الرقم السري المولد تلقائياً
      phone: phone || '',
      role: 'owner',
      status: 'active',
      isVerified: true,
      permissions: [
        'view_properties',
        'manage_properties',
        'create_contracts',
        'view_tenants',
        'view_reports',
        'manage_units'
      ],
      credentials: {
        username,
        password: autoPassword,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      },
      ownerDetails: {
        nationalId,
        nationalIdExpiry: nationalIdExpiry || '',
        type: 'individual_omani'
      },
      profile: {
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=200`,
        company: '',
        location: '',
        bio: '',
        nationalId,
        lastLogin: new Date().toISOString(),
        loginCount: 0
      },
      subscription: {
        plan: 'professional',
        planName: 'الخطة الاحترافية',
        status: 'active',
        startDate: new Date().toISOString(),
        expiresAt: '2099-12-31T23:59:59.999Z',
        remainingDays: 99999,
        features: [
          'unlimited_properties',
          'unlimited_tenants',
          'advanced_reports',
          'priority_support'
        ]
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

    // إضافة المالك للمصفوفة
    users.push(newOwner);

    // حفظ الملف
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');

    console.log('✅ New owner created:', newOwner.id, newOwner.username);

    res.status(200).json(newOwner);
  } catch (error) {
    console.error('Error adding owner:', error);
    res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
  }
}

