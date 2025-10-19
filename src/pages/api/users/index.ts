// src/pages/api/users/index.ts - API إدارة المستخدمين
import type { NextApiRequest, NextApiResponse } from 'next';
import { USER_ROLES, UserRole, getUserRoleConfig } from '@/lib/user-roles';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  subscription?: {
    planName: string;
    status: 'active' | 'expired' | 'cancelled';
    expiryDate: string;
    remainingDays: number;
  };
  profile?: {
    avatar?: string;
    company?: string;
    location?: string;
    ipAddress?: string;
    userAgent?: string;
    lastLogin?: string;
    loginCount?: number;
    documents?: Array<{
      type: string;
      name: string;
      url: string;
      verified: boolean;
    }>;
  };
  stats?: {
    properties: number;
    units: number;
    bookings: number;
    revenue: number;
    tasks: number;
    legalCases: number;
  };
  createdAt: string;
  lastActive: string;
  password?: string; // Only for internal use
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  pendingUsers: number;
  usersByRole: Record<string, number>;
  recentRegistrations: number;
  topUsers: User[];
}

// محاكاة قاعدة البيانات
let users: User[] = [
  {
    id: '1',
    name: 'أحمد محمد السالمي',
    email: 'ahmed@example.com',
    phone: '+968 9123 4567',
    role: 'property_landlord',
    status: 'active',
    subscription: {
      planName: 'الخطة المعيارية',
      status: 'active',
      expiryDate: '2025-12-31',
      remainingDays: 350
    },
    profile: {
      avatar: '/avatars/ahmed.jpg',
      company: 'شركة السالمي العقارية',
      location: 'مسقط، سلطنة عُمان',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      lastLogin: '2025-01-15T10:30:00Z',
      loginCount: 156,
      documents: [
        { type: 'id', name: 'بطاقة الهوية', url: '/docs/ahmed_id.pdf', verified: true },
        { type: 'license', name: 'رخصة تجارية', url: '/docs/ahmed_license.pdf', verified: true },
        { type: 'bank', name: 'البيانات البنكية', url: '/docs/ahmed_bank.pdf', verified: true }
      ]
    },
    stats: {
      properties: 12,
      units: 45,
      bookings: 23,
      revenue: 15420.50,
      tasks: 8,
      legalCases: 2
    },
    createdAt: '2024-06-15T08:00:00Z',
    lastActive: '2025-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'فاطمة علي الشنفري',
    email: 'fatima@company.com',
    phone: '+968 9876 5432',
    role: 'corporate_tenant',
    status: 'active',
    subscription: {
      planName: 'الخطة المميزة',
      status: 'active',
      expiryDate: '2025-11-30',
      remainingDays: 319
    },
    profile: {
      avatar: '/avatars/fatima.jpg',
      company: 'شركة الشنفري للتجارة',
      location: 'صلالة، سلطنة عُمان',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      lastLogin: '2025-01-15T09:15:00Z',
      loginCount: 89,
      documents: [
        { type: 'id', name: 'بطاقة الهوية', url: '/docs/fatima_id.pdf', verified: true },
        { type: 'commercial', name: 'السجل التجاري', url: '/docs/fatima_commercial.pdf', verified: true }
      ]
    },
    stats: {
      properties: 0,
      units: 8,
      bookings: 12,
      revenue: 0,
      tasks: 3,
      legalCases: 0
    },
    createdAt: '2024-08-20T12:00:00Z',
    lastActive: '2025-01-15T09:15:00Z'
  },
  {
    id: '3',
    name: 'سالم بن راشد الغافري',
    email: 'salim@realestate.com',
    phone: '+968 9234 5678',
    role: 'real_estate_agent',
    status: 'active',
    subscription: {
      planName: 'الخطة الأساسية',
      status: 'active',
      expiryDate: '2025-10-15',
      remainingDays: 273
    },
    profile: {
      avatar: '/avatars/salim.jpg',
      company: 'مكتب الغافري العقاري',
      location: 'نزوى، سلطنة عُمان',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      lastLogin: '2025-01-14T16:45:00Z',
      loginCount: 234,
      documents: [
        { type: 'id', name: 'بطاقة الهوية', url: '/docs/salim_id.pdf', verified: true },
        { type: 'license', name: 'رخصة الوساطة العقارية', url: '/docs/salim_broker.pdf', verified: true }
      ]
    },
    stats: {
      properties: 25,
      units: 67,
      bookings: 45,
      revenue: 8750.25,
      tasks: 12,
      legalCases: 1
    },
    createdAt: '2024-03-10T14:30:00Z',
    lastActive: '2025-01-14T16:45:00Z'
  },
  {
    id: '4',
    name: 'مريم أحمد العبري',
    email: 'mariam@tenant.com',
    phone: '+968 9456 7890',
    role: 'individual_tenant',
    status: 'active',
    subscription: {
      planName: 'مجاني',
      status: 'active',
      expiryDate: 'غير محدد',
      remainingDays: 999999
    },
    profile: {
      avatar: '/avatars/mariam.jpg',
        company: undefined,
      location: 'صور، سلطنة عُمان',
      ipAddress: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (Android 14; Mobile; rv:121.0) Gecko/121.0 Firefox/121.0',
      lastLogin: '2025-01-13T20:15:00Z',
      loginCount: 67,
      documents: [
        { type: 'id', name: 'بطاقة الهوية', url: '/docs/mariam_id.pdf', verified: true },
        { type: 'contract', name: 'عقد الإيجار', url: '/docs/mariam_contract.pdf', verified: true }
      ]
    },
    stats: {
      properties: 0,
      units: 1,
      bookings: 2,
      revenue: 0,
      tasks: 1,
      legalCases: 0
    },
    createdAt: '2024-11-05T10:00:00Z',
    lastActive: '2025-01-13T20:15:00Z'
  },
  {
    id: '5',
    name: 'خالد بن سعيد الكندي',
    email: 'khalid@admin.com',
    phone: '+968 9567 8901',
    role: 'site_admin',
    status: 'active',
    subscription: {
      planName: 'إدارة الموقع',
      status: 'active',
      expiryDate: 'غير محدد',
      remainingDays: 999999
    },
    profile: {
      avatar: '/avatars/khalid.jpg',
      company: 'عين عُمان',
      location: 'مسقط، سلطنة عُمان',
      ipAddress: '192.168.1.104',
      userAgent: 'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36',
      lastLogin: '2025-01-15T11:00:00Z',
      loginCount: 567,
      documents: [
        { type: 'id', name: 'بطاقة الهوية', url: '/docs/khalid_id.pdf', verified: true },
        { type: 'employment', name: 'عقد العمل', url: '/docs/khalid_employment.pdf', verified: true }
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
    createdAt: '2024-01-01T00:00:00Z',
    lastActive: '2025-01-15T11:00:00Z'
  }
];

// دوال مساعدة
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function validateUser(user: Partial<User>): string[] {
  const errors: string[] = [];

  if (!user.name || user.name.trim().length < 2) {
    errors.push('الاسم مطلوب ويجب أن يكون أكثر من حرفين');
  }

  if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    errors.push('البريد الإلكتروني غير صحيح');
  }

  if (!user.phone || user.phone.trim().length < 8) {
    errors.push('رقم الهاتف مطلوب ويجب أن يكون صحيحاً');
  }

  if (!user.role || !USER_ROLES[user.role as UserRole]) {
    errors.push('نوع المستخدم غير صحيح');
  }

  return errors;
}

function calculateUserStats(): UserStats {
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const inactiveUsers = users.filter(u => u.status === 'inactive').length;
  const suspendedUsers = users.filter(u => u.status === 'suspended').length;
  const pendingUsers = users.filter(u => u.status === 'pending').length;

  const usersByRole: Record<string, number> = {};
  Object.keys(USER_ROLES).forEach(role => {
    usersByRole[role] = users.filter(u => u.role === role).length;
  });

  const recentRegistrations = users.filter(u => {
    const createdAt = new Date(u.createdAt);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return createdAt > oneWeekAgo;
  }).length;

  const topUsers = users
    .sort((a, b) => (b.stats?.revenue || 0) - (a.stats?.revenue || 0))
    .slice(0, 5);

  return {
    totalUsers,
    activeUsers,
    inactiveUsers,
    suspendedUsers,
    pendingUsers,
    usersByRole,
    recentRegistrations,
    topUsers
  };
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const { method, query } = req;
  const { id, role, status, search, page = '1', limit = '10' } = query;

  try {
    switch (method) {
      case 'GET':
        if (id) {
          // جلب مستخدم محدد
          const user = users.find(u => u.id === id);
          if (!user) {
            return res.status(404).json({ error: 'المستخدم غير موجود' });
          }

          // إزالة كلمة المرور من الاستجابة
          const { password, ...userWithoutPassword } = user;
          return res.status(200).json({ user: userWithoutPassword });
        }

        // جلب قائمة المستخدمين مع فلترة
        let filteredUsers = [...users];

        // فلترة حسب الدور
        if (role && typeof role === 'string') {
          filteredUsers = filteredUsers.filter(u => u.role === role);
        }

        // فلترة حسب الحالة
        if (status && typeof status === 'string') {
          filteredUsers = filteredUsers.filter(u => u.status === status);
        }

        // البحث
        if (search && typeof search === 'string') {
          const searchTerm = search.toLowerCase();
          filteredUsers = filteredUsers.filter(u =>
            u.name.toLowerCase().includes(searchTerm) ||
            u.email.toLowerCase().includes(searchTerm) ||
            u.phone.includes(searchTerm) ||
            u.profile?.company?.toLowerCase().includes(searchTerm)
          );
        }

        // ترتيب
        filteredUsers.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());

        // صفحة
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

        // إزالة كلمات المرور
        const usersWithoutPasswords = paginatedUsers.map(({ password, ...user }) => user);

        // الإحصائيات
        const stats = calculateUserStats();

        return res.status(200).json({
          users: usersWithoutPasswords,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: filteredUsers.length,
            pages: Math.ceil(filteredUsers.length / limitNum)
          },
          stats
        });

      case 'POST':
        // إنشاء مستخدم جديد
        const newUserData = req.body;
        const validationErrors = validateUser(newUserData);

        if (validationErrors.length > 0) {
          return res.status(400).json({ 
            error: 'بيانات غير صحيحة',
            details: validationErrors 
          });
        }

        // التحقق من عدم وجود مستخدم بنفس البريد الإلكتروني
        const existingUser = users.find(u => u.email === newUserData.email);
        if (existingUser) {
          return res.status(409).json({ error: 'يوجد مستخدم مسجل بهذا البريد الإلكتروني' });
        }

        const newUser: User = {
          id: generateUserId(),
          name: newUserData.name,
          email: newUserData.email,
          phone: newUserData.phone,
          role: newUserData.role,
          status: 'pending',
          subscription: newUserData.subscription,
          profile: {
            company: newUserData.company,
            location: newUserData.location,
            ...newUserData.profile
          },
          stats: {
            properties: 0,
            units: 0,
            bookings: 0,
            revenue: 0,
            tasks: 0,
            legalCases: 0,
            ...newUserData.stats
          },
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          password: newUserData.password // يجب تشفيرها في التطبيق الحقيقي
        };

        users.push(newUser);

        // إزالة كلمة المرور من الاستجابة
        const { password, ...userWithoutPassword } = newUser;

        return res.status(201).json({ 
          user: userWithoutPassword,
          message: 'تم إنشاء المستخدم بنجاح'
        });

      case 'PUT':
        // تحديث مستخدم
        if (!id) {
          return res.status(400).json({ error: 'معرف المستخدم مطلوب' });
        }

        const userIndex = users.findIndex(u => u.id === id);
        if (userIndex === -1) {
          return res.status(404).json({ error: 'المستخدم غير موجود' });
        }

        const updateData = req.body;
        const updateValidationErrors = validateUser({ ...users[userIndex], ...updateData });

        if (updateValidationErrors.length > 0) {
          return res.status(400).json({ 
            error: 'بيانات غير صحيحة',
            details: updateValidationErrors 
          });
        }

        // تحديث البيانات
        users[userIndex] = {
          ...users[userIndex],
          ...updateData,
          id: users[userIndex].id, // الحفاظ على المعرف
          createdAt: users[userIndex].createdAt // الحفاظ على تاريخ الإنشاء
        };

        // إزالة كلمة المرور من الاستجابة
        const { password: _, ...updatedUserWithoutPassword } = users[userIndex];

        return res.status(200).json({ 
          user: updatedUserWithoutPassword,
          message: 'تم تحديث المستخدم بنجاح'
        });

      case 'DELETE':
        // حذف مستخدم
        if (!id) {
          return res.status(400).json({ error: 'معرف المستخدم مطلوب' });
        }

        const deleteIndex = users.findIndex(u => u.id === id);
        if (deleteIndex === -1) {
          return res.status(404).json({ error: 'المستخدم غير موجود' });
        }

        // منع حذف المدير الرئيسي
        if (users[deleteIndex].role === 'site_admin' && users[deleteIndex].email === 'khalid@admin.com') {
          return res.status(403).json({ error: 'لا يمكن حذف المدير الرئيسي' });
        }

        users.splice(deleteIndex, 1);

        return res.status(200).json({ 
          message: 'تم حذف المستخدم بنجاح'
        });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Error in users API:', error);
    return res.status(500).json({ 
      error: 'خطأ في الخادم',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    });
  }
}
