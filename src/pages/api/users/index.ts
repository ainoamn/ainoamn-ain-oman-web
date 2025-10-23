// src/pages/api/users/index.ts - API إدارة المستخدمين
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { USER_ROLES, UserRole, getUserRoleConfig } from '@/lib/user-roles';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole | string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  permissions?: string[];
  subscription?: {
    planName?: string;
    plan?: string;
    status: 'active' | 'expired' | 'cancelled';
    expiryDate?: string;
    expiresAt?: string;
    remainingDays?: number;
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
  isVerified?: boolean;
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

function loadUsers(): User[] {
  try {
    const usersPath = path.join(process.cwd(), '.data', 'users.json');
    console.log('📂 Loading users from:', usersPath);
    
    if (fs.existsSync(usersPath)) {
      const usersData = fs.readFileSync(usersPath, 'utf8');
      const users = JSON.parse(usersData);
      console.log('✅ Loaded', users.length, 'users from file');
      
      // تحميل صلاحيات الأدوار من roles-config
      const rolesPath = path.join(process.cwd(), '.data', 'roles-config.json');
      if (fs.existsSync(rolesPath)) {
        const rolesData = fs.readFileSync(rolesPath, 'utf8');
        const roles = JSON.parse(rolesData);
        
        // إضافة صلاحيات الدور لكل مستخدم إذا لم تكن موجودة
        return users.map((user: User) => {
          if (!user.permissions || user.permissions.length === 0) {
            const userRole = roles.find((r: any) => r.id === user.role);
            if (userRole) {
              user.permissions = userRole.permissions;
            }
          }
          return user;
        });
      }
      
      console.log('✅ Returning', users.length, 'users');
      return users;
    } else {
      console.error('❌ Users file not found at:', usersPath);
    }
  } catch (error) {
    console.error('❌ Error loading users:', error);
  }
  
  // إرجاع مصفوفة فارغة إذا لم يتم العثور على الملف
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

let users: User[] = loadUsers();

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
        // إعادة تحميل المستخدمين من الملف في كل طلب GET
        users = loadUsers();
        
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
        
        // حفظ المستخدمين في الملف
        saveUsers(users);

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
        
        // حفظ المستخدمين في الملف
        saveUsers(users);

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

        // منع حذف المدير الرئيسي ومالك الموقع
        if (users[deleteIndex].role === 'site_owner' || 
            users[deleteIndex].role === 'company_admin' || 
            users[deleteIndex].id === 'OWNER-000' || 
            users[deleteIndex].id === 'USER-001') {
          return res.status(403).json({ error: 'لا يمكن حذف مالك الموقع أو المدير الرئيسي' });
        }

        users.splice(deleteIndex, 1);
        
        // حفظ المستخدمين في الملف
        saveUsers(users);

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