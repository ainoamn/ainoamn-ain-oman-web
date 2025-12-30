// src/types/features.ts - أنواع الميزات والتحكم
export type FeatureId = 
  | 'ratings'                    // نظام التقييمات
  | 'marketer_points'            // نظام نقاط المسوقين
  | 'flexible_rental'            // الإيجار المرن
  | 'ai_insights'                // رؤى الذكاء الاصطناعي
  | 'ai_chatbot'                 // شات بوت الذكاء الاصطناعي
  | 'ai_valuation'               // تقييم العقارات بالذكاء الاصطناعي
  | 'auctions'                   // نظام المزادات
  | 'hoa_management'             // إدارة جمعيات الملاك
  | 'document_management'       // إدارة المستندات
  | 'virtual_tours'             // الجولات الافتراضية
  | 'logistics'                 // الخدمات اللوجستية
  | 'insurance'                 // التأمين
  | 'legal_consultation'         // الاستشارة القانونية
  | 'payment_gateway'           // بوابة الدفع
  | 'advanced_search'            // البحث المتقدم
  | 'analytics'                  // التحليلات
  | 'notifications'             // الإشعارات
  | 'messaging'                 // الرسائل
  | 'bookings'                  // الحجوزات
  | 'contracts'                 // العقود
  | 'multi_language'            // متعدد اللغات
  | 'multi_currency'            // متعدد العملات
  | 'vr_ar'                     // الواقع الافتراضي والمعزز
  | 'rewards'                   // نظام المكافآت
  | 'referrals'                 // نظام الإحالات
  | 'subscriptions'              // الاشتراكات
  | 'advertising'               // الإعلانات
  | 'reports'                   // التقارير
  | 'export_data'               // تصدير البيانات
  | 'api_access'                // الوصول للـ API
  | 'webhooks'                  // Webhooks
  | 'integrations'              // التكاملات
  | 'backup_restore'            // النسخ الاحتياطي والاستعادة
  | 'audit_logs'                // سجلات التدقيق
  | 'custom_fields'             // الحقول المخصصة
  | 'workflows'                 // سير العمل
  | 'approvals'                 // الموافقات
  | 'tasks'                     // المهام
  | 'calendar'                  // التقويم
  | 'file_storage'              // تخزين الملفات
  | 'email_templates'           // قوالب البريد
  | 'sms'                       // الرسائل النصية
  | 'push_notifications'        // الإشعارات الفورية
  | 'social_login'              // تسجيل الدخول الاجتماعي
  | 'two_factor_auth'           // المصادقة الثنائية
  | 'sso'                       // تسجيل الدخول الموحد
  | 'ip_whitelist'              // قائمة IP المسموحة
  | 'rate_limiting'             // تحديد معدل الطلبات
  | 'maintenance_mode'           // وضع الصيانة
  | 'beta_features'             // الميزات التجريبية
  | 'experimental';             // الميزات التجريبية

export type UserRole = 
  | 'super_admin'
  | 'admin'
  | 'property_manager'
  | 'property_owner'
  | 'tenant'
  | 'marketer'
  | 'viewer'
  | 'guest';

export type FeatureScope = 'global' | 'role' | 'user' | 'property' | 'organization';

export interface FeatureConfig {
  id: FeatureId;
  name: string;
  description: string;
  enabled: boolean;
  scope: FeatureScope;
  targetIds?: string[]; // IDs للمستخدمين/الأدوار/العقارات
  conditions?: {
    minSubscription?: string;
    maxUsers?: number;
    allowedRoles?: UserRole[];
    blockedRoles?: UserRole[];
    allowedCountries?: string[];
    blockedCountries?: string[];
    dateFrom?: number;
    dateTo?: number;
    customRules?: Record<string, any>;
  };
  metadata?: {
    version?: string;
    category?: string;
    tags?: string[];
    icon?: string;
    color?: string;
    priority?: number;
  };
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  updatedBy: string;
}

export interface FeatureOverride {
  id: string;
  featureId: FeatureId;
  scope: FeatureScope;
  targetId: string; // user ID, role, property ID, etc.
  enabled: boolean;
  reason?: string;
  expiresAt?: number;
  createdAt: number;
  createdBy: string;
}

export interface FeatureUsage {
  featureId: FeatureId;
  userId?: string;
  propertyId?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface FeatureStats {
  featureId: FeatureId;
  totalUsage: number;
  uniqueUsers: number;
  lastUsed?: number;
  averageUsagePerDay: number;
  topUsers: Array<{ userId: string; count: number }>;
  errors: number;
  successRate: number;
}






