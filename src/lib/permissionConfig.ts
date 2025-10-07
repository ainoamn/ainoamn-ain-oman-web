// src/lib/permissionConfig.ts - تكوين الصلاحيات لجميع ميزات النظام

export const FEATURE_PERMISSIONS = {
  // إدارة العقار
  PROPERTY_VIEW: 'prop_read',
  PROPERTY_MANAGE: 'prop_write',
  PROPERTY_ADMIN: 'prop_admin',
  
  // المهام
  TASKS_VIEW: 'task_read',
  TASKS_CREATE: 'task_write',
  TASKS_MANAGE: 'task_admin',
  
  // العقود
  CONTRACTS_VIEW: 'contract_read',
  CONTRACTS_CREATE: 'contract_write',
  CONTRACTS_MANAGE: 'contract_admin',
  
  // الفواتير
  INVOICES_VIEW: 'invoice_read',
  INVOICES_CREATE: 'invoice_write',
  INVOICES_MANAGE: 'invoice_admin',
  
  // الصيانة
  MAINTENANCE_VIEW: 'maintenance_read',
  MAINTENANCE_CREATE: 'maintenance_write',
  MAINTENANCE_MANAGE: 'maintenance_admin',
  
  // الشؤون القانونية
  LEGAL_VIEW: 'legal_read',
  LEGAL_CREATE: 'legal_write',
  LEGAL_MANAGE: 'legal_admin',
  
  // الطلبات
  REQUESTS_VIEW: 'request_read',
  REQUESTS_CREATE: 'request_write',
  REQUESTS_MANAGE: 'request_admin',
  
  // التقويم
  CALENDAR_VIEW: 'calendar_read',
  CALENDAR_CREATE: 'calendar_write',
  CALENDAR_MANAGE: 'calendar_admin',
  
  // التنبيهات
  NOTIFICATIONS_VIEW: 'notification_read',
  NOTIFICATIONS_MANAGE: 'notification_admin',
  
  // التقييمات
  REVIEWS_VIEW: 'review_read',
  REVIEWS_CREATE: 'review_write',
  REVIEWS_MANAGE: 'review_admin',
  
  // التنبؤات والذكاء الاصطناعي
  AI_INSIGHTS: 'ai_insights',
  AI_PREDICTIONS: 'ai_predictions',
  AI_ANALYTICS: 'ai_analytics',
  
  // المزادات
  AUCTIONS_VIEW: 'auction_read',
  AUCTIONS_CREATE: 'auction_write',
  AUCTIONS_MANAGE: 'auction_admin',
  AUCTIONS_BID: 'auction_bid',
  
  // الحسابات
  ACCOUNTING_VIEW: 'accounting_read',
  ACCOUNTING_MANAGE: 'accounting_admin',
  
  // المستخدمين
  USERS_VIEW: 'user_read',
  USERS_MANAGE: 'user_admin',
  
  // التقارير
  REPORTS_VIEW: 'report_read',
  REPORTS_ADVANCED: 'report_admin',
  
  // الحجوزات
  BOOKINGS_VIEW: 'booking_read',
  BOOKINGS_CREATE: 'booking_write',
  BOOKINGS_MANAGE: 'booking_admin',
};

// تكوين الأقسام في صفحة إدارة العقار
export const PROPERTY_ADMIN_SECTIONS = [
  {
    id: 'overview',
    nameAr: 'نظرة عامة',
    permission: FEATURE_PERMISSIONS.PROPERTY_VIEW,
    icon: '📊',
    description: 'عرض الإحصائيات والمؤشرات الرئيسية'
  },
  {
    id: 'tasks',
    nameAr: 'المهام',
    permission: FEATURE_PERMISSIONS.TASKS_VIEW,
    icon: '✅',
    description: 'إدارة المهام والأعمال'
  },
  {
    id: 'contracts',
    nameAr: 'عقود الإيجار',
    permission: FEATURE_PERMISSIONS.CONTRACTS_VIEW,
    icon: '📋',
    description: 'إدارة عقود الإيجار'
  },
  {
    id: 'invoices',
    nameAr: 'الفواتير والمدفوعات',
    permission: FEATURE_PERMISSIONS.INVOICES_VIEW,
    icon: '💰',
    description: 'إدارة الفواتير والمدفوعات'
  },
  {
    id: 'maintenance',
    nameAr: 'الصيانة',
    permission: FEATURE_PERMISSIONS.MAINTENANCE_VIEW,
    icon: '🔧',
    description: 'طلبات وأعمال الصيانة'
  },
  {
    id: 'legal',
    nameAr: 'الشؤون القانونية',
    permission: FEATURE_PERMISSIONS.LEGAL_VIEW,
    icon: '⚖️',
    description: 'القضايا والشؤون القانونية'
  },
  {
    id: 'requests',
    nameAr: 'الطلبات',
    permission: FEATURE_PERMISSIONS.REQUESTS_VIEW,
    icon: '📮',
    description: 'طلبات العملاء والمستأجرين'
  },
  {
    id: 'calendar',
    nameAr: 'التقويم',
    permission: FEATURE_PERMISSIONS.CALENDAR_VIEW,
    icon: '📆',
    description: 'المواعيد والأحداث'
  },
  {
    id: 'notifications',
    nameAr: 'التنبيهات',
    permission: FEATURE_PERMISSIONS.NOTIFICATIONS_VIEW,
    icon: '🔔',
    description: 'التنبيهات والإشعارات'
  },
  {
    id: 'reviews',
    nameAr: 'التقييمات',
    permission: FEATURE_PERMISSIONS.REVIEWS_VIEW,
    icon: '⭐',
    description: 'تقييمات العملاء'
  },
  {
    id: 'ai',
    nameAr: 'التنبؤات والذكاء',
    permission: FEATURE_PERMISSIONS.AI_INSIGHTS,
    icon: '🤖',
    description: 'تحليلات وتنبؤات ذكية'
  }
];

// دالة مساعدة لفحص الصلاحية
export function hasPermissionForSection(
  sectionId: string, 
  userPermissions: string[]
): boolean {
  const section = PROPERTY_ADMIN_SECTIONS.find(s => s.id === sectionId);
  if (!section) return false;
  return userPermissions.includes(section.permission);
}

// دالة لجلب الأقسام المتاحة للمستخدم
export function getAvailableSections(userPermissions: string[] = []): typeof PROPERTY_ADMIN_SECTIONS {
  return PROPERTY_ADMIN_SECTIONS.filter(section => 
    userPermissions.includes(section.permission)
  );
}

