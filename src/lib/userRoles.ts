// src/lib/userRoles.ts - نظام الأدوار والصلاحيات المتقدم
export type UserRole = 
  | 'super_admin'      // مدير النظام الكامل
  | 'admin'            // مدير عام
  | 'property_manager' // مدير عقارات
  | 'property_owner'   // مالك عقار
  | 'developer'        // مطور عقاري
  | 'agent'            // وسيط عقاري
  | 'tenant'           // مستأجر
  | 'investor'         // مستثمر
  | 'guest';           // زائر

export type Permission = 
  // إدارة النظام
  | 'system.manage'
  | 'system.settings'
  | 'system.analytics'
  | 'system.users'
  
  // إدارة العقارات
  | 'properties.create'
  | 'properties.read'
  | 'properties.update'
  | 'properties.delete'
  | 'properties.manage_all'
  
  // إدارة الحجوزات
  | 'bookings.create'
  | 'bookings.read'
  | 'bookings.update'
  | 'bookings.delete'
  | 'bookings.manage_all'
  
  // إدارة المهام
  | 'tasks.create'
  | 'tasks.read'
  | 'tasks.update'
  | 'tasks.delete'
  | 'tasks.assign'
  
  // إدارة المالية
  | 'financial.read'
  | 'financial.create'
  | 'financial.update'
  | 'financial.delete'
  | 'financial.reports'
  
  // إدارة العملاء
  | 'customers.read'
  | 'customers.create'
  | 'customers.update'
  | 'customers.delete'
  
  // إدارة العقود
  | 'contracts.create'
  | 'contracts.read'
  | 'contracts.update'
  | 'contracts.delete'
  | 'contracts.sign'
  
  // إدارة المزادات
  | 'auctions.create'
  | 'auctions.read'
  | 'auctions.update'
  | 'auctions.delete'
  | 'auctions.bid'
  
  // إدارة الاستثمار
  | 'investment.read'
  | 'investment.create'
  | 'investment.update'
  | 'investment.delete'
  
  // إدارة التطوير
  | 'development.read'
  | 'development.create'
  | 'development.update'
  | 'development.delete'
  
  // إدارة الجمعيات
  | 'hoa.read'
  | 'hoa.create'
  | 'hoa.update'
  | 'hoa.delete'
  | 'hoa.manage'
  
  // إدارة الإعلانات
  | 'ads.create'
  | 'ads.read'
  | 'ads.update'
  | 'ads.delete'
  | 'ads.featured'
  
  // إدارة التقارير
  | 'reports.read'
  | 'reports.create'
  | 'reports.export'
  
  // إدارة الإشعارات
  | 'notifications.read'
  | 'notifications.create'
  | 'notifications.send'
  
  // إدارة الملفات
  | 'files.upload'
  | 'files.read'
  | 'files.delete'
  
  // إدارة اللغات
  | 'i18n.manage'
  | 'i18n.translate';

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  description: string;
  color: string;
  icon: string;
  features: string[];
  limits: {
    maxProperties?: number;
    maxBookings?: number;
    maxAds?: number;
    maxAuctions?: number;
    maxStorage?: number; // في MB
    maxUsers?: number;
  };
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  super_admin: {
    role: 'super_admin',
    permissions: [
      'system.manage', 'system.settings', 'system.analytics', 'system.users',
      'properties.manage_all', 'bookings.manage_all', 'tasks.create', 'tasks.read', 'tasks.update', 'tasks.delete', 'tasks.assign',
      'financial.read', 'financial.create', 'financial.update', 'financial.delete', 'financial.reports',
      'customers.read', 'customers.create', 'customers.update', 'customers.delete',
      'contracts.create', 'contracts.read', 'contracts.update', 'contracts.delete', 'contracts.sign',
      'auctions.create', 'auctions.read', 'auctions.update', 'auctions.delete', 'auctions.bid',
      'investment.read', 'investment.create', 'investment.update', 'investment.delete',
      'development.read', 'development.create', 'development.update', 'development.delete',
      'hoa.read', 'hoa.create', 'hoa.update', 'hoa.delete', 'hoa.manage',
      'ads.create', 'ads.read', 'ads.update', 'ads.delete', 'ads.featured',
      'reports.read', 'reports.create', 'reports.export',
      'notifications.read', 'notifications.create', 'notifications.send',
      'files.upload', 'files.read', 'files.delete',
      'i18n.manage', 'i18n.translate'
    ],
    description: 'مدير النظام الكامل - صلاحيات غير محدودة',
    color: 'red',
    icon: '👑',
    features: ['إدارة شاملة', 'صلاحيات غير محدودة', 'مراقبة النظام', 'إعدادات متقدمة'],
    limits: {}
  },

  admin: {
    role: 'admin',
    permissions: [
      'system.analytics', 'system.users',
      'properties.manage_all', 'bookings.manage_all', 'tasks.create', 'tasks.read', 'tasks.update', 'tasks.delete', 'tasks.assign',
      'financial.read', 'financial.create', 'financial.update', 'financial.reports',
      'customers.read', 'customers.create', 'customers.update', 'customers.delete',
      'contracts.create', 'contracts.read', 'contracts.update', 'contracts.delete',
      'auctions.create', 'auctions.read', 'auctions.update', 'auctions.delete',
      'investment.read', 'investment.create', 'investment.update',
      'development.read', 'development.create', 'development.update',
      'hoa.read', 'hoa.create', 'hoa.update', 'hoa.manage',
      'ads.create', 'ads.read', 'ads.update', 'ads.delete', 'ads.featured',
      'reports.read', 'reports.create', 'reports.export',
      'notifications.read', 'notifications.create', 'notifications.send',
      'files.upload', 'files.read', 'files.delete'
    ],
    description: 'مدير عام - صلاحيات إدارية واسعة',
    color: 'orange',
    icon: '🛡️',
    features: ['إدارة العقارات', 'إدارة الحجوزات', 'التقارير المالية', 'إدارة العملاء'],
    limits: {
      maxProperties: 1000,
      maxBookings: 10000,
      maxAds: 500,
      maxAuctions: 100,
      maxStorage: 10000,
      maxUsers: 1000
    }
  },

  property_manager: {
    role: 'property_manager',
    permissions: [
      'properties.create', 'properties.read', 'properties.update', 'properties.delete',
      'bookings.create', 'bookings.read', 'bookings.update', 'bookings.delete',
      'tasks.create', 'tasks.read', 'tasks.update', 'tasks.assign',
      'financial.read', 'financial.create', 'financial.update',
      'customers.read', 'customers.create', 'customers.update',
      'contracts.create', 'contracts.read', 'contracts.update',
      'auctions.create', 'auctions.read', 'auctions.update',
      'investment.read', 'investment.create',
      'development.read', 'development.create',
      'hoa.read', 'hoa.create', 'hoa.update',
      'ads.create', 'ads.read', 'ads.update',
      'reports.read', 'reports.create',
      'notifications.read', 'notifications.create',
      'files.upload', 'files.read'
    ],
    description: 'مدير عقارات - إدارة شاملة للعقارات',
    color: 'green',
    icon: '🏢',
    features: ['إدارة العقارات', 'إدارة الحجوزات', 'إدارة المهام', 'التقارير المالية'],
    limits: {
      maxProperties: 100,
      maxBookings: 1000,
      maxAds: 50,
      maxAuctions: 20,
      maxStorage: 1000,
      maxUsers: 50
    }
  },

  property_owner: {
    role: 'property_owner',
    permissions: [
      'properties.create', 'properties.read', 'properties.update',
      'bookings.read', 'bookings.update',
      'tasks.read', 'tasks.update',
      'financial.read',
      'customers.read',
      'contracts.read',
      'auctions.create', 'auctions.read', 'auctions.update',
      'investment.read',
      'development.read',
      'hoa.read',
      'ads.create', 'ads.read', 'ads.update',
      'reports.read',
      'notifications.read',
      'files.upload', 'files.read'
    ],
    description: 'مالك عقار - إدارة عقاراته الخاصة',
    color: 'blue',
    icon: '🏠',
    features: ['إدارة عقاراته', 'عرض الحجوزات', 'المزادات', 'التقارير المالية'],
    limits: {
      maxProperties: 20,
      maxBookings: 200,
      maxAds: 10,
      maxAuctions: 5,
      maxStorage: 500,
      maxUsers: 10
    }
  },

  developer: {
    role: 'developer',
    permissions: [
      'properties.create', 'properties.read', 'properties.update',
      'bookings.read',
      'tasks.read',
      'financial.read',
      'customers.read',
      'contracts.read',
      'investment.read', 'investment.create', 'investment.update',
      'development.read', 'development.create', 'development.update', 'development.delete',
      'hoa.read',
      'ads.create', 'ads.read', 'ads.update',
      'reports.read',
      'notifications.read',
      'files.upload', 'files.read'
    ],
    description: 'مطور عقاري - إدارة مشاريع التطوير',
    color: 'purple',
    icon: '🏗️',
    features: ['إدارة المشاريع', 'التطوير العقاري', 'الاستثمار', 'التقارير'],
    limits: {
      maxProperties: 50,
      maxBookings: 500,
      maxAds: 20,
      maxAuctions: 10,
      maxStorage: 2000,
      maxUsers: 25
    }
  },

  agent: {
    role: 'agent',
    permissions: [
      'properties.read',
      'bookings.create', 'bookings.read', 'bookings.update',
      'tasks.read', 'tasks.update',
      'customers.read', 'customers.create', 'customers.update',
      'contracts.read',
      'auctions.read', 'auctions.bid',
      'ads.create', 'ads.read', 'ads.update',
      'reports.read',
      'notifications.read',
      'files.upload', 'files.read'
    ],
    description: 'وسيط عقاري - تسهيل المعاملات',
    color: 'teal',
    icon: '🤝',
    features: ['الوساطة العقارية', 'إدارة العملاء', 'المزادات', 'العقود'],
    limits: {
      maxProperties: 0,
      maxBookings: 100,
      maxAds: 5,
      maxAuctions: 0,
      maxStorage: 100,
      maxUsers: 5
    }
  },

  tenant: {
    role: 'tenant',
    permissions: [
      'properties.read',
      'bookings.create', 'bookings.read',
      'tasks.read',
      'customers.read',
      'contracts.read', 'contracts.sign',
      'auctions.read', 'auctions.bid',
      'reports.read',
      'notifications.read',
      'files.read'
    ],
    description: 'مستأجر - إدارة حجوزاته وعقوده',
    color: 'cyan',
    icon: '👤',
    features: ['عرض العقارات', 'الحجوزات', 'العقود', 'المزادات'],
    limits: {
      maxProperties: 0,
      maxBookings: 10,
      maxAds: 0,
      maxAuctions: 0,
      maxStorage: 50,
      maxUsers: 0
    }
  },

  investor: {
    role: 'investor',
    permissions: [
      'properties.read',
      'bookings.read',
      'tasks.read',
      'financial.read',
      'customers.read',
      'contracts.read',
      'auctions.read', 'auctions.bid',
      'investment.read', 'investment.create',
      'reports.read',
      'notifications.read',
      'files.read'
    ],
    description: 'مستثمر - تحليل ومراقبة الاستثمارات',
    color: 'yellow',
    icon: '💰',
    features: ['تحليل الاستثمار', 'المزادات', 'التقارير المالية', 'مراقبة السوق'],
    limits: {
      maxProperties: 0,
      maxBookings: 0,
      maxAds: 0,
      maxAuctions: 0,
      maxStorage: 100,
      maxUsers: 0
    }
  },

  guest: {
    role: 'guest',
    permissions: [
      'properties.read',
      'auctions.read',
      'notifications.read',
      'files.read'
    ],
    description: 'زائر - عرض محدود للمحتوى',
    color: 'gray',
    icon: '👁️',
    features: ['عرض العقارات', 'المزادات', 'التسجيل'],
    limits: {
      maxProperties: 0,
      maxBookings: 0,
      maxAds: 0,
      maxAuctions: 0,
      maxStorage: 10,
      maxUsers: 0
    }
  }
};

// دالة للتحقق من الصلاحيات
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return rolePermissions.permissions.includes(permission);
}

// دالة للحصول على جميع الصلاحيات لدور معين
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role].permissions;
}

// دالة للتحقق من الحدود
export function checkLimit(userRole: UserRole, limitType: keyof RolePermissions['limits'], currentCount: number): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  const limit = rolePermissions.limits[limitType];
  
  if (limit === undefined || limit === null) {
    return true; // لا يوجد حد
  }
  
  return currentCount < limit;
}

// دالة للحصول على معلومات الدور
export function getRoleInfo(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role];
}

// دالة للحصول على جميع الأدوار
export function getAllRoles(): RolePermissions[] {
  return Object.values(ROLE_PERMISSIONS);
}

// دالة للتحقق من ترقية الدور
export function canUpgradeRole(currentRole: UserRole, targetRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    guest: 0,
    tenant: 1,
    investor: 2,
    agent: 3,
    property_owner: 4,
    developer: 5,
    property_manager: 6,
    admin: 7,
    super_admin: 8
  };
  
  return roleHierarchy[targetRole] > roleHierarchy[currentRole];
}

// دالة للحصول على الأدوار المتاحة للترقية
export function getAvailableUpgrades(currentRole: UserRole): UserRole[] {
  return getAllRoles()
    .filter(role => canUpgradeRole(currentRole, role.role))
    .map(role => role.role);
}



