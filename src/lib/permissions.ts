// src/lib/permissions.ts - نظام الصلاحيات الكامل

export interface Permission {
  id: string;
  name: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  category: 'properties' | 'financial' | 'legal' | 'maintenance' | 'admin' | 'reports' | 'other';
  requiredPlan?: 'free' | 'basic' | 'professional' | 'premium' | 'enterprise';
}

export const ALL_PERMISSIONS: Permission[] = [
  // صلاحيات العقارات
  {
    id: 'view_properties',
    name: { ar: 'عرض العقارات', en: 'View Properties' },
    description: { ar: 'القدرة على عرض قائمة العقارات', en: 'Ability to view property listings' },
    category: 'properties',
    requiredPlan: 'free'
  },
  {
    id: 'add_property',
    name: { ar: 'إضافة عقار', en: 'Add Property' },
    description: { ar: 'القدرة على إضافة عقارات جديدة', en: 'Ability to add new properties' },
    category: 'properties',
    requiredPlan: 'basic'
  },
  {
    id: 'edit_property',
    name: { ar: 'تعديل عقار', en: 'Edit Property' },
    description: { ar: 'القدرة على تعديل العقارات', en: 'Ability to edit properties' },
    category: 'properties',
    requiredPlan: 'basic'
  },
  {
    id: 'delete_property',
    name: { ar: 'حذف عقار', en: 'Delete Property' },
    description: { ar: 'القدرة على حذف العقارات', en: 'Ability to delete properties' },
    category: 'properties',
    requiredPlan: 'professional'
  },
  {
    id: 'manage_units',
    name: { ar: 'إدارة الوحدات', en: 'Manage Units' },
    description: { ar: 'القدرة على إدارة وحدات العقار', en: 'Ability to manage property units' },
    category: 'properties',
    requiredPlan: 'basic'
  },

  // صلاحيات المالية
  {
    id: 'view_financial',
    name: { ar: 'عرض المالية', en: 'View Financial' },
    description: { ar: 'القدرة على عرض البيانات المالية', en: 'Ability to view financial data' },
    category: 'financial',
    requiredPlan: 'professional'
  },
  {
    id: 'create_invoice',
    name: { ar: 'إنشاء فاتورة', en: 'Create Invoice' },
    description: { ar: 'القدرة على إنشاء فواتير', en: 'Ability to create invoices' },
    category: 'financial',
    requiredPlan: 'professional'
  },
  {
    id: 'edit_invoice',
    name: { ar: 'تعديل فاتورة', en: 'Edit Invoice' },
    description: { ar: 'القدرة على تعديل الفواتير', en: 'Ability to edit invoices' },
    category: 'financial',
    requiredPlan: 'professional'
  },
  {
    id: 'delete_invoice',
    name: { ar: 'حذف فاتورة', en: 'Delete Invoice' },
    description: { ar: 'القدرة على حذف الفواتير', en: 'Ability to delete invoices' },
    category: 'financial',
    requiredPlan: 'premium'
  },
  {
    id: 'manage_checks',
    name: { ar: 'إدارة الشيكات', en: 'Manage Checks' },
    description: { ar: 'القدرة على إدارة الشيكات', en: 'Ability to manage checks' },
    category: 'financial',
    requiredPlan: 'professional'
  },
  {
    id: 'view_reports',
    name: { ar: 'عرض التقارير المالية', en: 'View Financial Reports' },
    description: { ar: 'القدرة على عرض التقارير المالية', en: 'Ability to view financial reports' },
    category: 'financial',
    requiredPlan: 'premium'
  },

  // صلاحيات القانونية
  {
    id: 'view_legal',
    name: { ar: 'عرض القضايا القانونية', en: 'View Legal Cases' },
    description: { ar: 'القدرة على عرض القضايا القانونية', en: 'Ability to view legal cases' },
    category: 'legal',
    requiredPlan: 'premium'
  },
  {
    id: 'create_legal_case',
    name: { ar: 'إنشاء قضية قانونية', en: 'Create Legal Case' },
    description: { ar: 'القدرة على إنشاء قضايا قانونية', en: 'Ability to create legal cases' },
    category: 'legal',
    requiredPlan: 'premium'
  },
  {
    id: 'edit_legal_case',
    name: { ar: 'تعديل قضية قانونية', en: 'Edit Legal Case' },
    description: { ar: 'القدرة على تعديل القضايا القانونية', en: 'Ability to edit legal cases' },
    category: 'legal',
    requiredPlan: 'premium'
  },

  // صلاحيات الصيانة
  {
    id: 'view_maintenance',
    name: { ar: 'عرض الصيانة', en: 'View Maintenance' },
    description: { ar: 'القدرة على عرض طلبات الصيانة', en: 'Ability to view maintenance requests' },
    category: 'maintenance',
    requiredPlan: 'basic'
  },
  {
    id: 'create_maintenance',
    name: { ar: 'إنشاء طلب صيانة', en: 'Create Maintenance Request' },
    description: { ar: 'القدرة على إنشاء طلبات صيانة', en: 'Ability to create maintenance requests' },
    category: 'maintenance',
    requiredPlan: 'basic'
  },
  {
    id: 'assign_maintenance',
    name: { ar: 'تعيين الصيانة', en: 'Assign Maintenance' },
    description: { ar: 'القدرة على تعيين طلبات الصيانة للفنيين', en: 'Ability to assign maintenance to technicians' },
    category: 'maintenance',
    requiredPlan: 'professional'
  },

  // صلاحيات الإدارة
  {
    id: 'manage_users',
    name: { ar: 'إدارة المستخدمين', en: 'Manage Users' },
    description: { ar: 'القدرة على إدارة المستخدمين والصلاحيات', en: 'Ability to manage users and permissions' },
    category: 'admin',
    requiredPlan: 'enterprise'
  },
  {
    id: 'view_users',
    name: { ar: 'عرض المستخدمين', en: 'View Users' },
    description: { ar: 'القدرة على عرض قائمة المستخدمين', en: 'Ability to view user list' },
    category: 'admin',
    requiredPlan: 'premium'
  },
  {
    id: 'manage_subscriptions',
    name: { ar: 'إدارة الاشتراكات', en: 'Manage Subscriptions' },
    description: { ar: 'القدرة على إدارة اشتراكات المستخدمين', en: 'Ability to manage user subscriptions' },
    category: 'admin',
    requiredPlan: 'enterprise'
  },
  {
    id: 'system_settings',
    name: { ar: 'إعدادات النظام', en: 'System Settings' },
    description: { ar: 'القدرة على تعديل إعدادات النظام', en: 'Ability to modify system settings' },
    category: 'admin',
    requiredPlan: 'enterprise'
  },

  // صلاحيات التقارير
  {
    id: 'view_basic_reports',
    name: { ar: 'عرض التقارير الأساسية', en: 'View Basic Reports' },
    description: { ar: 'القدرة على عرض التقارير الأساسية', en: 'Ability to view basic reports' },
    category: 'reports',
    requiredPlan: 'professional'
  },
  {
    id: 'view_advanced_reports',
    name: { ar: 'عرض التقارير المتقدمة', en: 'View Advanced Reports' },
    description: { ar: 'القدرة على عرض التقارير المتقدمة والتحليلات', en: 'Ability to view advanced reports and analytics' },
    category: 'reports',
    requiredPlan: 'premium'
  },
  {
    id: 'export_reports',
    name: { ar: 'تصدير التقارير', en: 'Export Reports' },
    description: { ar: 'القدرة على تصدير التقارير بصيغ مختلفة', en: 'Ability to export reports in various formats' },
    category: 'reports',
    requiredPlan: 'premium'
  },

  // صلاحيات أخرى
  {
    id: 'manage_tasks',
    name: { ar: 'إدارة المهام', en: 'Manage Tasks' },
    description: { ar: 'القدرة على إدارة المهام', en: 'Ability to manage tasks' },
    category: 'other',
    requiredPlan: 'basic'
  },
  {
    id: 'view_analytics',
    name: { ar: 'عرض التحليلات', en: 'View Analytics' },
    description: { ar: 'القدرة على عرض التحليلات والإحصائيات', en: 'Ability to view analytics and statistics' },
    category: 'other',
    requiredPlan: 'premium'
  }
];

// الصلاحيات الافتراضية لكل دور
export const ROLE_DEFAULT_PERMISSIONS: Record<string, string[]> = {
  'company_admin': ['*'], // جميع الصلاحيات
  
  'property_owner': [
    'view_properties',
    'add_property',
    'edit_property',
    'manage_units',
    'view_financial',
    'create_invoice',
    'edit_invoice',
    'view_maintenance',
    'create_maintenance',
    'manage_tasks',
    'view_basic_reports'
  ],
  
  'property_manager': [
    'view_properties',
    'edit_property',
    'manage_units',
    'view_maintenance',
    'create_maintenance',
    'assign_maintenance',
    'manage_tasks'
  ],
  
  'accountant': [
    'view_financial',
    'create_invoice',
    'edit_invoice',
    'manage_checks',
    'view_reports',
    'view_advanced_reports',
    'export_reports'
  ],
  
  'legal_advisor': [
    'view_legal',
    'create_legal_case',
    'edit_legal_case',
    'view_basic_reports'
  ],
  
  'sales_agent': [
    'view_properties',
    'add_property',
    'view_maintenance',
    'manage_tasks'
  ],
  
  'maintenance_staff': [
    'view_maintenance',
    'manage_tasks'
  ],
  
  'tenant': [
    'view_properties',
    'view_maintenance',
    'create_maintenance'
  ],
  
  'investor': [
    'view_properties',
    'view_financial',
    'view_reports',
    'view_analytics'
  ],
  
  'customer_viewer': [
    'view_properties'
  ]
};

// خريطة الصفحات والصلاحيات المطلوبة
export const PAGE_PERMISSIONS: Record<string, string[]> = {
  // العقارات
  '/properties': ['view_properties'],
  '/properties/new': ['add_property'],
  '/properties/[id]/edit': ['edit_property'],
  '/properties/unified-management': ['edit_property', 'manage_units'],
  
  // المالية
  '/admin/financial': ['view_financial'],
  '/admin/financial/invoices': ['view_financial', 'create_invoice'],
  '/admin/financial/checks': ['view_financial', 'manage_checks'],
  '/admin/financial/payments': ['view_financial'],
  '/admin/financial/receivables': ['view_financial'],
  '/admin/financial/payables': ['view_financial'],
  '/admin/financial/sales': ['view_financial', 'create_invoice'],
  '/admin/financial/purchases': ['view_financial'],
  '/admin/financial/reports': ['view_reports'],
  
  // القانونية
  '/legal': ['view_legal'],
  '/legal/new': ['create_legal_case'],
  '/legal/[caseId]': ['view_legal'],
  '/legal/drafts': ['view_legal'],
  
  // الصيانة
  '/admin/maintenance': ['view_maintenance'],
  '/admin/maintenance/new': ['create_maintenance'],
  
  // المهام
  '/admin/tasks': ['manage_tasks'],
  '/tasks/new': ['manage_tasks'],
  
  // الإدارة
  '/admin/users': ['manage_users'],
  '/admin/subscriptions': ['manage_subscriptions'],
  '/admin/settings': ['system_settings'],
  
  // التقارير
  '/reports': ['view_basic_reports'],
  '/reports/advanced': ['view_advanced_reports']
};

// التحقق من الصلاحية
export function hasPermission(
  userPermissions: string[],
  requiredPermission: string | string[]
): boolean {
  // إذا كان لدى المستخدم صلاحية '*' (الكل)
  if (userPermissions.includes('*')) {
    return true;
  }

  // إذا كانت الصلاحية المطلوبة array
  if (Array.isArray(requiredPermission)) {
    return requiredPermission.some(perm => userPermissions.includes(perm));
  }

  // صلاحية واحدة
  return userPermissions.includes(requiredPermission);
}

// التحقق من صلاحية الدخول لصفحة
export function canAccessPage(
  userPermissions: string[],
  pagePath: string
): boolean {
  const requiredPerms = PAGE_PERMISSIONS[pagePath];
  
  // إذا لم تكن الصفحة في القائمة، السماح بالوصول
  if (!requiredPerms) {
    return true;
  }

  return hasPermission(userPermissions, requiredPerms);
}

// الحصول على الصلاحيات من الباقة
export function getSubscriptionPermissions(plan: string): string[] {
  const planPermissions: Record<string, string[]> = {
    'free': ['view_properties'],
    
    'basic': [
      'view_properties',
      'add_property',
      'edit_property',
      'manage_units',
      'view_maintenance',
      'create_maintenance',
      'manage_tasks'
    ],
    
    'professional': [
      'view_properties',
      'add_property',
      'edit_property',
      'delete_property',
      'manage_units',
      'view_financial',
      'create_invoice',
      'edit_invoice',
      'manage_checks',
      'view_maintenance',
      'create_maintenance',
      'assign_maintenance',
      'manage_tasks',
      'view_basic_reports'
    ],
    
    'premium': [
      'view_properties',
      'add_property',
      'edit_property',
      'delete_property',
      'manage_units',
      'view_financial',
      'create_invoice',
      'edit_invoice',
      'delete_invoice',
      'manage_checks',
      'view_reports',
      'view_advanced_reports',
      'export_reports',
      'view_legal',
      'create_legal_case',
      'edit_legal_case',
      'view_maintenance',
      'create_maintenance',
      'assign_maintenance',
      'manage_tasks',
      'view_analytics',
      'view_users'
    ],
    
    'enterprise': ['*'] // جميع الصلاحيات
  };

  return planPermissions[plan] || [];
}

// دمج صلاحيات الدور + الباقة
export function getUserPermissions(
  role: string,
  subscriptionPlan?: string | null
): string[] {
  const rolePermissions = ROLE_DEFAULT_PERMISSIONS[role] || [];
  const subscriptionPermissions = subscriptionPlan ? getSubscriptionPermissions(subscriptionPlan) : [];
  
  // دمج الصلاحيات (إزالة التكرار)
  const allPermissions = [...new Set([...rolePermissions, ...subscriptionPermissions])];
  
  return allPermissions;
}

