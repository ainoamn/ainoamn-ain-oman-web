// نظام الصلاحيات الشامل لجميع ميزات الموقع

export interface FeaturePermission {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  requiredPlan: 'basic' | 'standard' | 'premium' | 'enterprise';
  icon?: string;
}

// جميع الصلاحيات في الموقع
export const FEATURE_PERMISSIONS: Record<string, FeaturePermission> = {
  // نظرة عامة
  OVERVIEW: {
    id: 'overview',
    name: 'Overview',
    nameAr: 'نظرة عامة',
    description: 'View property overview and statistics',
    descriptionAr: 'عرض نظرة عامة وإحصائيات العقار',
    category: 'property_management',
    requiredPlan: 'basic',
    icon: 'FiHome'
  },

  // المهام
  TASKS_VIEW: {
    id: 'tasks_view',
    name: 'View Tasks',
    nameAr: 'عرض المهام',
    description: 'View property tasks',
    descriptionAr: 'عرض مهام العقار',
    category: 'property_management',
    requiredPlan: 'standard',
    icon: 'FiCheckSquare'
  },
  TASKS_MANAGE: {
    id: 'tasks_manage',
    name: 'Manage Tasks',
    nameAr: 'إدارة المهام',
    description: 'Create and manage tasks',
    descriptionAr: 'إنشاء وإدارة المهام',
    category: 'property_management',
    requiredPlan: 'standard',
    icon: 'FiCheckSquare'
  },

  // عقود الإيجار
  LEASES_VIEW: {
    id: 'leases_view',
    name: 'View Lease Contracts',
    nameAr: 'عرض عقود الإيجار',
    description: 'View lease contracts',
    descriptionAr: 'عرض عقود الإيجار',
    category: 'property_management',
    requiredPlan: 'basic',
    icon: 'FiFileText'
  },
  LEASES_MANAGE: {
    id: 'leases_manage',
    name: 'Manage Lease Contracts',
    nameAr: 'إدارة عقود الإيجار',
    description: 'Create and manage lease contracts',
    descriptionAr: 'إنشاء وإدارة عقود الإيجار',
    category: 'property_management',
    requiredPlan: 'standard',
    icon: 'FiFileText'
  },

  // الفواتير والمدفوعات
  INVOICES_VIEW: {
    id: 'invoices_view',
    name: 'View Invoices',
    nameAr: 'عرض الفواتير',
    description: 'View invoices and payments',
    descriptionAr: 'عرض الفواتير والمدفوعات',
    category: 'property_management',
    requiredPlan: 'basic',
    icon: 'FiDollarSign'
  },
  INVOICES_MANAGE: {
    id: 'invoices_manage',
    name: 'Manage Invoices',
    nameAr: 'إدارة الفواتير',
    description: 'Create and manage invoices',
    descriptionAr: 'إنشاء وإدارة الفواتير',
    category: 'property_management',
    requiredPlan: 'standard',
    icon: 'FiDollarSign'
  },

  // الصيانة
  MAINTENANCE_VIEW: {
    id: 'maintenance_view',
    name: 'View Maintenance',
    nameAr: 'عرض الصيانة',
    description: 'View maintenance requests',
    descriptionAr: 'عرض طلبات الصيانة',
    category: 'property_management',
    requiredPlan: 'standard',
    icon: 'FiTool'
  },
  MAINTENANCE_MANAGE: {
    id: 'maintenance_manage',
    name: 'Manage Maintenance',
    nameAr: 'إدارة الصيانة',
    description: 'Create and manage maintenance requests',
    descriptionAr: 'إنشاء وإدارة طلبات الصيانة',
    category: 'property_management',
    requiredPlan: 'standard',
    icon: 'FiTool'
  },

  // الشؤون القانونية
  LEGAL_VIEW: {
    id: 'legal_view',
    name: 'View Legal Cases',
    nameAr: 'عرض القضايا القانونية',
    description: 'View legal cases',
    descriptionAr: 'عرض القضايا القانونية',
    category: 'property_management',
    requiredPlan: 'premium',
    icon: 'FiShield'
  },
  LEGAL_MANAGE: {
    id: 'legal_manage',
    name: 'Manage Legal Cases',
    nameAr: 'إدارة القضايا القانونية',
    description: 'Create and manage legal cases',
    descriptionAr: 'إنشاء وإدارة القضايا القانونية',
    category: 'property_management',
    requiredPlan: 'premium',
    icon: 'FiShield'
  },

  // العقود
  CONTRACTS_VIEW: {
    id: 'contracts_view',
    name: 'View Contracts',
    nameAr: 'عرض العقود',
    description: 'View all contracts',
    descriptionAr: 'عرض جميع العقود',
    category: 'property_management',
    requiredPlan: 'basic',
    icon: 'FiFileText'
  },
  CONTRACTS_MANAGE: {
    id: 'contracts_manage',
    name: 'Manage Contracts',
    nameAr: 'إدارة العقود',
    description: 'Create and manage contracts',
    descriptionAr: 'إنشاء وإدارة العقود',
    category: 'property_management',
    requiredPlan: 'standard',
    icon: 'FiFileText'
  },

  // الطلبات
  REQUESTS_VIEW: {
    id: 'requests_view',
    name: 'View Requests',
    nameAr: 'عرض الطلبات',
    description: 'View tenant requests',
    descriptionAr: 'عرض طلبات المستأجرين',
    category: 'property_management',
    requiredPlan: 'basic',
    icon: 'FiInbox'
  },
  REQUESTS_MANAGE: {
    id: 'requests_manage',
    name: 'Manage Requests',
    nameAr: 'إدارة الطلبات',
    description: 'Respond to and manage requests',
    descriptionAr: 'الرد على وإدارة الطلبات',
    category: 'property_management',
    requiredPlan: 'standard',
    icon: 'FiInbox'
  },

  // التقويم
  CALENDAR_VIEW: {
    id: 'calendar_view',
    name: 'View Calendar',
    nameAr: 'عرض التقويم',
    description: 'View calendar events',
    descriptionAr: 'عرض أحداث التقويم',
    category: 'property_management',
    requiredPlan: 'standard',
    icon: 'FiCalendar'
  },
  CALENDAR_MANAGE: {
    id: 'calendar_manage',
    name: 'Manage Calendar',
    nameAr: 'إدارة التقويم',
    description: 'Create and manage calendar events',
    descriptionAr: 'إنشاء وإدارة أحداث التقويم',
    category: 'property_management',
    requiredPlan: 'standard',
    icon: 'FiCalendar'
  },

  // التنبيهات
  ALERTS_VIEW: {
    id: 'alerts_view',
    name: 'View Alerts',
    nameAr: 'عرض التنبيهات',
    description: 'View property alerts',
    descriptionAr: 'عرض تنبيهات العقار',
    category: 'property_management',
    requiredPlan: 'standard',
    icon: 'FiBell'
  },
  ALERTS_MANAGE: {
    id: 'alerts_manage',
    name: 'Manage Alerts',
    nameAr: 'إدارة التنبيهات',
    description: 'Create and manage alerts',
    descriptionAr: 'إنشاء وإدارة التنبيهات',
    category: 'property_management',
    requiredPlan: 'standard',
    icon: 'FiBell'
  },

  // التقييمات
  REVIEWS_VIEW: {
    id: 'reviews_view',
    name: 'View Reviews',
    nameAr: 'عرض التقييمات',
    description: 'View property reviews',
    descriptionAr: 'عرض تقييمات العقار',
    category: 'property_management',
    requiredPlan: 'basic',
    icon: 'FiStar'
  },
  REVIEWS_MANAGE: {
    id: 'reviews_manage',
    name: 'Manage Reviews',
    nameAr: 'إدارة التقييمات',
    description: 'Respond to reviews',
    descriptionAr: 'الرد على التقييمات',
    category: 'property_management',
    requiredPlan: 'standard',
    icon: 'FiStar'
  },

  // التنبؤات والذكاء الاصطناعي
  AI_ANALYTICS: {
    id: 'ai_analytics',
    name: 'AI Analytics',
    nameAr: 'التنبؤات والذكاء',
    description: 'AI-powered predictions and insights',
    descriptionAr: 'تنبؤات ورؤى مدعومة بالذكاء الاصطناعي',
    category: 'property_management',
    requiredPlan: 'premium',
    icon: 'FiTrendingUp'
  },

  // ميزات إضافية
  ADVANCED_REPORTS: {
    id: 'advanced_reports',
    name: 'Advanced Reports',
    nameAr: 'التقارير المتقدمة',
    description: 'Generate advanced reports',
    descriptionAr: 'إنشاء التقارير المتقدمة',
    category: 'property_management',
    requiredPlan: 'premium',
    icon: 'FiBarChart2'
  },

  BULK_OPERATIONS: {
    id: 'bulk_operations',
    name: 'Bulk Operations',
    nameAr: 'العمليات الجماعية',
    description: 'Perform bulk operations',
    descriptionAr: 'تنفيذ العمليات الجماعية',
    category: 'property_management',
    requiredPlan: 'premium',
    icon: 'FiLayers'
  },

  API_ACCESS: {
    id: 'api_access',
    name: 'API Access',
    nameAr: 'الوصول للـ API',
    description: 'Access to API',
    descriptionAr: 'الوصول إلى واجهة البرمجة',
    category: 'system',
    requiredPlan: 'enterprise',
    icon: 'FiCode'
  },

  WHITE_LABEL: {
    id: 'white_label',
    name: 'White Label',
    nameAr: 'العلامة البيضاء',
    description: 'White label solution',
    descriptionAr: 'حل العلامة البيضاء',
    category: 'system',
    requiredPlan: 'enterprise',
    icon: 'FiLayout'
  }
};

// تعيين الصلاحيات لكل باقة
export const PLAN_FEATURES: Record<string, string[]> = {
  basic: [
    'OVERVIEW',
    'LEASES_VIEW',
    'INVOICES_VIEW',
    'CONTRACTS_VIEW',
    'REQUESTS_VIEW',
    'REVIEWS_VIEW'
  ],
  standard: [
    'OVERVIEW',
    'TASKS_VIEW',
    'TASKS_MANAGE',
    'LEASES_VIEW',
    'LEASES_MANAGE',
    'INVOICES_VIEW',
    'INVOICES_MANAGE',
    'MAINTENANCE_VIEW',
    'MAINTENANCE_MANAGE',
    'CONTRACTS_VIEW',
    'CONTRACTS_MANAGE',
    'REQUESTS_VIEW',
    'REQUESTS_MANAGE',
    'CALENDAR_VIEW',
    'CALENDAR_MANAGE',
    'ALERTS_VIEW',
    'ALERTS_MANAGE',
    'REVIEWS_VIEW',
    'REVIEWS_MANAGE'
  ],
  premium: [
    'OVERVIEW',
    'TASKS_VIEW',
    'TASKS_MANAGE',
    'LEASES_VIEW',
    'LEASES_MANAGE',
    'INVOICES_VIEW',
    'INVOICES_MANAGE',
    'MAINTENANCE_VIEW',
    'MAINTENANCE_MANAGE',
    'LEGAL_VIEW',
    'LEGAL_MANAGE',
    'CONTRACTS_VIEW',
    'CONTRACTS_MANAGE',
    'REQUESTS_VIEW',
    'REQUESTS_MANAGE',
    'CALENDAR_VIEW',
    'CALENDAR_MANAGE',
    'ALERTS_VIEW',
    'ALERTS_MANAGE',
    'REVIEWS_VIEW',
    'REVIEWS_MANAGE',
    'AI_ANALYTICS',
    'ADVANCED_REPORTS',
    'BULK_OPERATIONS'
  ],
  enterprise: [
    'OVERVIEW',
    'TASKS_VIEW',
    'TASKS_MANAGE',
    'LEASES_VIEW',
    'LEASES_MANAGE',
    'INVOICES_VIEW',
    'INVOICES_MANAGE',
    'MAINTENANCE_VIEW',
    'MAINTENANCE_MANAGE',
    'LEGAL_VIEW',
    'LEGAL_MANAGE',
    'CONTRACTS_VIEW',
    'CONTRACTS_MANAGE',
    'REQUESTS_VIEW',
    'REQUESTS_MANAGE',
    'CALENDAR_VIEW',
    'CALENDAR_MANAGE',
    'ALERTS_VIEW',
    'ALERTS_MANAGE',
    'REVIEWS_VIEW',
    'REVIEWS_MANAGE',
    'AI_ANALYTICS',
    'ADVANCED_REPORTS',
    'BULK_OPERATIONS',
    'API_ACCESS',
    'WHITE_LABEL'
  ]
};

// دالة للتحقق من الصلاحية
export function hasFeature(userPlan: string, featureId: string): boolean {
  const planFeatures = PLAN_FEATURES[userPlan] || [];
  return planFeatures.includes(featureId);
}

// دالة للحصول على جميع ميزات الباقة
export function getPlanFeatures(planId: string): FeaturePermission[] {
  const featureIds = PLAN_FEATURES[planId] || [];
  return featureIds.map(id => FEATURE_PERMISSIONS[id]).filter(Boolean);
}

// دالة للحصول على الميزات المتاحة للمستخدم
export function getUserFeatures(userPlan: string): FeaturePermission[] {
  return getPlanFeatures(userPlan);
}

// دالة للحصول على الميزات المفقودة
export function getMissingFeatures(userPlan: string, requiredFeatures: string[]): FeaturePermission[] {
  const userFeatures = PLAN_FEATURES[userPlan] || [];
  const missingIds = requiredFeatures.filter(id => !userFeatures.includes(id));
  return missingIds.map(id => FEATURE_PERMISSIONS[id]).filter(Boolean);
}

// دالة لإيجاد أقل باقة تحتوي على ميزة
export function getMinimumPlanForFeature(featureId: string): string {
  const feature = FEATURE_PERMISSIONS[featureId];
  return feature?.requiredPlan || 'enterprise';
}

