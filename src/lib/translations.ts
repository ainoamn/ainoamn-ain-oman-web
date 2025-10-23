// src/lib/translations.ts - ترجمات الأدوار والباقات والتصنيفات

/**
 * ترجمة أسماء الأدوار (Roles) للعربية
 */
export const ROLE_NAMES_AR: Record<string, string> = {
  // الأدوار الإدارية
  'site_owner': 'مالك الموقع',
  'company_admin': 'مدير الشركة',
  'admin': 'مدير',
  'site_admin': 'مدير الموقع',
  
  // أدوار العقارات
  'property_owner': 'مالك عقار',
  'property_landlord': 'مالك عقار',
  'property_manager': 'مدير عقار',
  'real_estate_agent': 'وسيط عقاري',
  'sales_agent': 'مندوب مبيعات',
  
  // أدوار المالية
  'accountant': 'محاسب',
  'financial_accountant': 'محاسب مالي',
  
  // أدوار القانونية
  'legal_advisor': 'مستشار قانوني',
  'lawyer': 'محامي',
  
  // أدوار الصيانة
  'maintenance_staff': 'فني صيانة',
  'maintenance_technician': 'فني صيانة',
  
  // أدوار العملاء
  'tenant': 'مستأجر',
  'individual_tenant': 'مستأجر فردي',
  'corporate_tenant': 'مستأجر شركات',
  'investor': 'مستثمر',
  'customer_viewer': 'عميل متصفح',
  'customer': 'عميل',
  'user': 'مستخدم',
  'owner': 'مالك',
};

/**
 * ترجمة أسماء الباقات (Plans) للعربية
 */
export const PLAN_NAMES_AR: Record<string, string> = {
  // باقات أساسية
  'free': 'مجاني',
  'basic': 'الأساسية',
  'standard': 'المعيارية',
  'premium': 'المميزة',
  'professional': 'الاحترافية',
  'enterprise': 'المؤسسية',
  'enterprise_unlimited': 'مؤسسية غير محدودة',
  
  // باقات خاصة
  'site_owner': 'مالك الموقع',
  'staff': 'موظف',
  'trial': 'تجريبي',
  'custom': 'مخصص',
};

/**
 * ترجمة تصنيفات الصلاحيات (Permission Categories) للعربية
 */
export const CATEGORY_NAMES_AR: Record<string, string> = {
  'properties': 'العقارات',
  'financial': 'المالية',
  'legal': 'القانونية',
  'maintenance': 'الصيانة',
  'admin': 'الإدارة',
  'reports': 'التقارير',
  'analytics': 'التحليلات',
  'users': 'المستخدمين',
  'settings': 'الإعدادات',
  'other': 'أخرى',
};

/**
 * ترجمة حالات المستخدم (User Status) للعربية
 */
export const STATUS_NAMES_AR: Record<string, string> = {
  'active': 'نشط',
  'inactive': 'غير نشط',
  'suspended': 'موقوف',
  'pending': 'قيد الانتظار',
  'verified': 'موثق',
  'unverified': 'غير موثق',
  'blocked': 'محظور',
};

/**
 * ترجمة حالات الاشتراك (Subscription Status) للعربية
 */
export const SUBSCRIPTION_STATUS_AR: Record<string, string> = {
  'active': 'نشط',
  'expired': 'منتهي',
  'cancelled': 'ملغي',
  'pending': 'قيد الانتظار',
  'trial': 'تجريبي',
};

/**
 * دالة مساعدة للحصول على ترجمة الدور
 */
export function getRoleNameAr(role: string): string {
  return ROLE_NAMES_AR[role] || role;
}

/**
 * دالة مساعدة للحصول على ترجمة الباقة
 */
export function getPlanNameAr(plan: string): string {
  return PLAN_NAMES_AR[plan?.toLowerCase()] || plan;
}

/**
 * دالة مساعدة للحصول على ترجمة التصنيف
 */
export function getCategoryNameAr(category: string): string {
  return CATEGORY_NAMES_AR[category] || category;
}

/**
 * دالة مساعدة للحصول على ترجمة الحالة
 */
export function getStatusNameAr(status: string): string {
  return STATUS_NAMES_AR[status] || status;
}

/**
 * دالة مساعدة للحصول على ترجمة حالة الاشتراك
 */
export function getSubscriptionStatusAr(status: string): string {
  return SUBSCRIPTION_STATUS_AR[status] || status;
}

