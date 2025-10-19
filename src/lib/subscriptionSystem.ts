// نظام الاشتراكات والصلاحيات المتكامل
export interface SubscriptionPlan {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  currency: string;
  duration: 'monthly' | 'yearly';
  features: string[];
  featuresAr: string[];
  permissions: Permission[];
  maxProperties: number;
  maxUnits: number;
  maxBookings: number;
  maxUsers: number;
  storageGB: number;
  priority: 'basic' | 'standard' | 'premium' | 'enterprise';
  color: string;
  popular?: boolean;
}

export interface Permission {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: 'property' | 'booking' | 'user' | 'analytics' | 'system' | 'calendar' | 'tasks';
  level: 'read' | 'write' | 'admin';
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  autoRenew: boolean;
  paymentMethod: string;
  lastPaymentDate: string;
  nextPaymentDate: string;
  totalPaid: number;
  remainingDays: number;
  usage: {
    properties: number;
    units: number;
    bookings: number;
    users: number;
    storage: number;
  };
  limits: {
    properties: number;
    units: number;
    bookings: number;
    users: number;
    storage: number;
  };
}

export interface PaymentHistory {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  paymentDate: string;
  dueDate: string;
  paymentMethod: string;
  transactionId: string;
  description: string;
}

// خطط الاشتراك المتاحة
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    nameAr: 'الخطة الأساسية',
    description: 'Perfect for individual property owners',
    descriptionAr: 'مثالية لأصحاب العقارات الأفراد',
    price: 29,
    currency: 'OMR',
    duration: 'monthly',
    features: [
      'Up to 5 properties',
      'Up to 20 units',
      'Basic booking management',
      'Email support',
      'Basic analytics'
    ],
    featuresAr: [
      'حتى 5 عقارات',
      'حتى 20 وحدة',
      'إدارة الحجوزات الأساسية',
      'دعم عبر البريد الإلكتروني',
      'تحليلات أساسية'
    ],
    permissions: [
      { id: 'prop_read', name: 'View Properties', nameAr: 'عرض العقارات', description: 'View property details', descriptionAr: 'عرض تفاصيل العقارات', category: 'property', level: 'read' },
      { id: 'prop_write', name: 'Manage Properties', nameAr: 'إدارة العقارات', description: 'Add and edit properties', descriptionAr: 'إضافة وتعديل العقارات', category: 'property', level: 'write' },
      { id: 'booking_read', name: 'View Bookings', nameAr: 'عرض الحجوزات', description: 'View booking details', descriptionAr: 'عرض تفاصيل الحجوزات', category: 'booking', level: 'read' },
      { id: 'booking_write', name: 'Manage Bookings', nameAr: 'إدارة الحجوزات', description: 'Create and edit bookings', descriptionAr: 'إنشاء وتعديل الحجوزات', category: 'booking', level: 'write' }
    ],
    maxProperties: 5,
    maxUnits: 20,
    maxBookings: 100,
    maxUsers: 1,
    storageGB: 1,
    priority: 'basic',
    color: 'bg-blue-500'
  },
  {
    id: 'standard',
    name: 'Standard Plan',
    nameAr: 'الخطة المعيارية',
    description: 'Ideal for small property management companies',
    descriptionAr: 'مثالية لشركات إدارة العقارات الصغيرة',
    price: 79,
    currency: 'OMR',
    duration: 'monthly',
    features: [
      'Up to 25 properties',
      'Up to 100 units',
      'Advanced booking management',
      'Calendar integration',
      'Task management',
      'Priority support',
      'Advanced analytics',
      'Multi-user access'
    ],
    featuresAr: [
      'حتى 25 عقار',
      'حتى 100 وحدة',
      'إدارة الحجوزات المتقدمة',
      'تكامل التقويم',
      'إدارة المهام',
      'دعم ذو أولوية',
      'تحليلات متقدمة',
      'وصول متعدد المستخدمين'
    ],
    permissions: [
      { id: 'prop_read', name: 'View Properties', nameAr: 'عرض العقارات', description: 'View property details', descriptionAr: 'عرض تفاصيل العقارات', category: 'property', level: 'read' },
      { id: 'prop_write', name: 'Manage Properties', nameAr: 'إدارة العقارات', description: 'Add and edit properties', descriptionAr: 'إضافة وتعديل العقارات', category: 'property', level: 'write' },
      { id: 'booking_read', name: 'View Bookings', nameAr: 'عرض الحجوزات', description: 'View booking details', descriptionAr: 'عرض تفاصيل الحجوزات', category: 'booking', level: 'read' },
      { id: 'booking_write', name: 'Manage Bookings', nameAr: 'إدارة الحجوزات', description: 'Create and edit bookings', descriptionAr: 'إنشاء وتعديل الحجوزات', category: 'booking', level: 'write' },
      { id: 'calendar_read', name: 'View Calendar', nameAr: 'عرض التقويم', description: 'View calendar events', descriptionAr: 'عرض أحداث التقويم', category: 'calendar', level: 'read' },
      { id: 'calendar_write', name: 'Manage Calendar', nameAr: 'إدارة التقويم', description: 'Create and edit calendar events', descriptionAr: 'إنشاء وتعديل أحداث التقويم', category: 'calendar', level: 'write' },
      { id: 'task_read', name: 'View Tasks', nameAr: 'عرض المهام', description: 'View task details', descriptionAr: 'عرض تفاصيل المهام', category: 'tasks', level: 'read' },
      { id: 'task_write', name: 'Manage Tasks', nameAr: 'إدارة المهام', description: 'Create and edit tasks', descriptionAr: 'إنشاء وتعديل المهام', category: 'tasks', level: 'write' }
    ],
    maxProperties: 25,
    maxUnits: 100,
    maxBookings: 500,
    maxUsers: 5,
    storageGB: 10,
    priority: 'standard',
    color: 'bg-green-500',
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    nameAr: 'الخطة المميزة',
    description: 'Perfect for growing property management businesses',
    descriptionAr: 'مثالية لشركات إدارة العقارات المتنامية',
    price: 149,
    currency: 'OMR',
    duration: 'monthly',
    features: [
      'Up to 100 properties',
      'Up to 500 units',
      'Full booking management',
      'Advanced calendar integration',
      'Complete task management',
      'AI-powered analytics',
      '24/7 support',
      'Unlimited users',
      'Custom integrations',
      'Advanced reporting'
    ],
    featuresAr: [
      'حتى 100 عقار',
      'حتى 500 وحدة',
      'إدارة الحجوزات الكاملة',
      'تكامل التقويم المتقدم',
      'إدارة المهام الكاملة',
      'تحليلات مدعومة بالذكاء الاصطناعي',
      'دعم 24/7',
      'مستخدمون غير محدودين',
      'تكاملات مخصصة',
      'تقارير متقدمة'
    ],
    permissions: [
      { id: 'prop_read', name: 'View Properties', nameAr: 'عرض العقارات', description: 'View property details', descriptionAr: 'عرض تفاصيل العقارات', category: 'property', level: 'read' },
      { id: 'prop_write', name: 'Manage Properties', nameAr: 'إدارة العقارات', description: 'Add and edit properties', descriptionAr: 'إضافة وتعديل العقارات', category: 'property', level: 'write' },
      { id: 'prop_admin', name: 'Admin Properties', nameAr: 'إدارة العقارات الكاملة', description: 'Full property administration', descriptionAr: 'إدارة العقارات الكاملة', category: 'property', level: 'admin' },
      { id: 'booking_read', name: 'View Bookings', nameAr: 'عرض الحجوزات', description: 'View booking details', descriptionAr: 'عرض تفاصيل الحجوزات', category: 'booking', level: 'read' },
      { id: 'booking_write', name: 'Manage Bookings', nameAr: 'إدارة الحجوزات', description: 'Create and edit bookings', descriptionAr: 'إنشاء وتعديل الحجوزات', category: 'booking', level: 'write' },
      { id: 'booking_admin', name: 'Admin Bookings', nameAr: 'إدارة الحجوزات الكاملة', description: 'Full booking administration', descriptionAr: 'إدارة الحجوزات الكاملة', category: 'booking', level: 'admin' },
      { id: 'calendar_read', name: 'View Calendar', nameAr: 'عرض التقويم', description: 'View calendar events', descriptionAr: 'عرض أحداث التقويم', category: 'calendar', level: 'read' },
      { id: 'calendar_write', name: 'Manage Calendar', nameAr: 'إدارة التقويم', description: 'Create and edit calendar events', descriptionAr: 'إنشاء وتعديل أحداث التقويم', category: 'calendar', level: 'write' },
      { id: 'calendar_admin', name: 'Admin Calendar', nameAr: 'إدارة التقويم الكاملة', description: 'Full calendar administration', descriptionAr: 'إدارة التقويم الكاملة', category: 'calendar', level: 'admin' },
      { id: 'task_read', name: 'View Tasks', nameAr: 'عرض المهام', description: 'View task details', descriptionAr: 'عرض تفاصيل المهام', category: 'tasks', level: 'read' },
      { id: 'task_write', name: 'Manage Tasks', nameAr: 'إدارة المهام', description: 'Create and edit tasks', descriptionAr: 'إنشاء وتعديل المهام', category: 'tasks', level: 'write' },
      { id: 'task_admin', name: 'Admin Tasks', nameAr: 'إدارة المهام الكاملة', description: 'Full task administration', descriptionAr: 'إدارة المهام الكاملة', category: 'tasks', level: 'admin' },
      { id: 'analytics_read', name: 'View Analytics', nameAr: 'عرض التحليلات', description: 'View analytics and reports', descriptionAr: 'عرض التحليلات والتقارير', category: 'analytics', level: 'read' },
      { id: 'analytics_write', name: 'Manage Analytics', nameAr: 'إدارة التحليلات', description: 'Create and edit analytics', descriptionAr: 'إنشاء وتعديل التحليلات', category: 'analytics', level: 'write' }
    ],
    maxProperties: 100,
    maxUnits: 500,
    maxBookings: 2000,
    maxUsers: -1, // unlimited
    storageGB: 50,
    priority: 'premium',
    color: 'bg-purple-500'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    nameAr: 'الخطة المؤسسية',
    description: 'For large property management enterprises',
    descriptionAr: 'للشركات الكبيرة في إدارة العقارات',
    price: 299,
    currency: 'OMR',
    duration: 'monthly',
    features: [
      'Unlimited properties',
      'Unlimited units',
      'Full system access',
      'Custom integrations',
      'Dedicated support',
      'AI-powered insights',
      'White-label solution',
      'API access',
      'Custom reporting',
      'Priority features'
    ],
    featuresAr: [
      'عقارات غير محدودة',
      'وحدات غير محدودة',
      'وصول كامل للنظام',
      'تكاملات مخصصة',
      'دعم مخصص',
      'رؤى مدعومة بالذكاء الاصطناعي',
      'حل العلامة البيضاء',
      'وصول API',
      'تقارير مخصصة',
      'ميزات ذات أولوية'
    ],
    permissions: [
      { id: 'system_admin', name: 'System Admin', nameAr: 'إدارة النظام', description: 'Full system administration', descriptionAr: 'إدارة النظام الكاملة', category: 'system', level: 'admin' },
      { id: 'user_admin', name: 'User Admin', nameAr: 'إدارة المستخدمين', description: 'Full user administration', descriptionAr: 'إدارة المستخدمين الكاملة', category: 'user', level: 'admin' }
    ],
    maxProperties: -1, // unlimited
    maxUnits: -1, // unlimited
    maxBookings: -1, // unlimited
    maxUsers: -1, // unlimited
    storageGB: 200,
    priority: 'enterprise',
    color: 'bg-red-500'
  }
];

// فئات الصلاحيات
export const PERMISSION_CATEGORIES = {
  property: { name: 'Properties', nameAr: 'العقارات', icon: '🏢' },
  booking: { name: 'Bookings', nameAr: 'الحجوزات', icon: '📅' },
  user: { name: 'Users', nameAr: 'المستخدمون', icon: '👥' },
  analytics: { name: 'Analytics', nameAr: 'التحليلات', icon: '📊' },
  system: { name: 'System', nameAr: 'النظام', icon: '⚙️' },
  calendar: { name: 'Calendar', nameAr: 'التقويم', icon: '📅' },
  tasks: { name: 'Tasks', nameAr: 'المهام', icon: '⚡' }
};

// مستويات الصلاحيات
export const PERMISSION_LEVELS = {
  read: { name: 'Read', nameAr: 'قراءة', color: 'bg-blue-100 text-blue-800' },
  write: { name: 'Write', nameAr: 'كتابة', color: 'bg-green-100 text-green-800' },
  admin: { name: 'Admin', nameAr: 'إدارة', color: 'bg-red-100 text-red-800' }
};

// فئة إدارة الاشتراكات
export class SubscriptionManager {
  private subscriptions: UserSubscription[] = [];
  private payments: PaymentHistory[] = [];

  // الحصول على خطة الاشتراك
  getPlan(planId: string): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
  }

  // الحصول على جميع الخطط
  getAllPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS;
  }

  // الحصول على اشتراك المستخدم
  getUserSubscription(userId: string): UserSubscription | undefined {
    return this.subscriptions.find(sub => sub.userId === userId && sub.status === 'active');
  }

  // إنشاء اشتراك جديد
  createSubscription(userId: string, planId: string, paymentMethod: string): UserSubscription {
    const plan = this.getPlan(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const startDate = new Date().toISOString();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + (plan.duration === 'yearly' ? 12 : 1));
    
    const subscription: UserSubscription = {
      id: `sub_${Date.now()}`,
      userId,
      planId,
      startDate,
      endDate: endDate.toISOString(),
      status: 'active',
      autoRenew: true,
      paymentMethod,
      lastPaymentDate: startDate,
      nextPaymentDate: endDate.toISOString(),
      totalPaid: plan.price,
      remainingDays: Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      usage: {
        properties: 0,
        units: 0,
        bookings: 0,
        users: 1,
        storage: 0
      },
      limits: {
        properties: plan.maxProperties,
        units: plan.maxUnits,
        bookings: plan.maxBookings,
        users: plan.maxUsers,
        storage: plan.storageGB
      }
    };

    this.subscriptions.push(subscription);
    return subscription;
  }

  // التحقق من الصلاحيات
  hasPermission(userId: string, permissionId: string): boolean {
    const subscription = this.getUserSubscription(userId);
    if (!subscription) return false;

    const plan = this.getPlan(subscription.planId);
    if (!plan) return false;

    return plan.permissions.some(permission => permission.id === permissionId);
  }

  // التحقق من الحدود
  checkLimit(userId: string, resource: 'properties' | 'units' | 'bookings' | 'users' | 'storage'): boolean {
    const subscription = this.getUserSubscription(userId);
    if (!subscription) return false;

    const limit = subscription.limits[resource];
    const usage = subscription.usage[resource];

    return limit === -1 || usage < limit; // -1 يعني غير محدود
  }

  // تحديث الاستخدام
  updateUsage(userId: string, resource: 'properties' | 'units' | 'bookings' | 'users' | 'storage', increment: number = 1): void {
    const subscription = this.getUserSubscription(userId);
    if (subscription) {
      subscription.usage[resource] += increment;
    }
  }

  // الحصول على إحصائيات الاشتراك
  getSubscriptionStats(userId: string) {
    const subscription = this.getUserSubscription(userId);
    if (!subscription) return null;

    const plan = this.getPlan(subscription.planId);
    if (!plan) return null;

    return {
      plan: plan,
      subscription: subscription,
      usage: subscription.usage,
      limits: subscription.limits,
      remainingDays: subscription.remainingDays,
      canUpgrade: this.canUpgrade(userId),
      canDowngrade: this.canDowngrade(userId),
      nextPaymentDate: subscription.nextPaymentDate,
      totalPaid: subscription.totalPaid
    };
  }

  // التحقق من إمكانية الترقية
  canUpgrade(userId: string): boolean {
    const subscription = this.getUserSubscription(userId);
    if (!subscription) return true;

    const currentPlanIndex = SUBSCRIPTION_PLANS.findIndex(plan => plan.id === subscription.planId);
    return currentPlanIndex < SUBSCRIPTION_PLANS.length - 1;
  }

  // التحقق من إمكانية التخفيض
  canDowngrade(userId: string): boolean {
    const subscription = this.getUserSubscription(userId);
    if (!subscription) return false;

    const currentPlanIndex = SUBSCRIPTION_PLANS.findIndex(plan => plan.id === subscription.planId);
    return currentPlanIndex > 0;
  }
}

// إنشاء مثيل عام لإدارة الاشتراكات
export const subscriptionManager = new SubscriptionManager();
