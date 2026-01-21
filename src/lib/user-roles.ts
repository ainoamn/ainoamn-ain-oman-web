// نظام الأدوار الكامل لمنصة عين عُمان
// Complete User Roles System for Ain Oman Platform

export type UserRole = 
  | 'individual_tenant'           // 1. مستأجر فردي
  | 'corporate_tenant'            // 2. مستأجر شركة
  | 'basic_landlord'              // 3. مؤجر فردي عادي
  | 'property_landlord'           // 4. مؤجر فردي يملك عقارات متعددة
  | 'corporate_landlord'          // 5. مؤجر شركة
  | 'property_manager'            // 6. مدير عقارات فردي
  | 'service_provider'            // 7. مقدم خدمة
  | 'admin_staff'                 // 8. مستخدم موظف/إداري
  | 'real_estate_agent'           // 9. وسيط عقاري
  | 'investor'                    // 10. مستثمر
  | 'sub_user'                    // 11. مستخدم فرعي
  | 'guest'                       // 12. ضيف
  | 'site_admin'                  // 13. إدارة الموقع
  | 'agency'                      // 14. الوكالة العقارية
  | 'hoa'                         // 15. جمعية الملاك
  | 'developer';                  // 16. المطور العقاري

export interface UserPermissions {
  // العقارات
  canViewAllProperties: boolean;
  canViewOwnProperties: boolean;
  canCreateProperty: boolean;
  canEditProperty: boolean;
  canDeleteProperty: boolean;
  canPublishProperty: boolean;
  
  // الوحدات
  canViewAllUnits: boolean;
  canViewOwnUnits: boolean;
  canManageUnits: boolean;
  
  // العقود والإيجارات
  canViewContracts: boolean;
  canCreateContracts: boolean;
  canEditContracts: boolean;
  canDeleteContracts: boolean;
  
  // الفواتير والمدفوعات
  canViewInvoices: boolean;
  canCreateInvoices: boolean;
  canEditInvoices: boolean;
  canDeleteInvoices: boolean;
  canProcessPayments: boolean;
  
  // المهام والصيانة
  canViewTasks: boolean;
  canCreateTasks: boolean;
  canEditTasks: boolean;
  canAssignTasks: boolean;
  
  // المستخدمين
  canViewUsers: boolean;
  canCreateUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canAssignRoles: boolean;
  
  // التقارير والتحليلات
  canViewReports: boolean;
  canViewAnalytics: boolean;
  canExportData: boolean;
  
  // الإعدادات
  canAccessAdmin: boolean;
  canManageSettings: boolean;
  canManagePackages: boolean;
  
  // المزادات
  canViewAuctions: boolean;
  canCreateAuctions: boolean;
  canManageAuctions: boolean;
  
  // القضايا القانونية
  canViewLegal: boolean;
  canCreateLegal: boolean;
  canManageLegal: boolean;
}

export interface UserRoleConfig {
  id: UserRole;
  name: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  dashboardPath: string;
  profilePath: string;
  permissions: UserPermissions;
  maxProperties?: number;
  maxUnits?: number;
  maxUsers?: number;
  color: string;
  icon: string;
  features: string[];
}

// تعريف جميع الأدوار وصلاحياتها
export const USER_ROLES: Record<UserRole, UserRoleConfig> = {
  
  // 1. مستأجر فردي (Individual Tenant)
  individual_tenant: {
    id: 'individual_tenant',
    name: { ar: 'مستأجر فردي', en: 'Individual Tenant' },
    description: { 
      ar: 'مستأجر لوحدة واحدة أو أكثر في عقار', 
      en: 'Tenant of one or more units in a property' 
    },
    dashboardPath: '/dashboard/tenant',
    profilePath: '/profile',
    maxProperties: 0,
    maxUnits: 10,
    maxUsers: 1,
    color: 'blue',
    icon: '🏠',
    features: [
      'عرض وإدارة عقد الإيجار',
      'دفع الفواتير والإيجارات',
      'إرسال طلبات صيانة',
      'استلام الإشعارات',
      'إنهاء العقد أو طلب التجديد'
    ],
    permissions: {
      canViewAllProperties: false,
      canViewOwnProperties: false,
      canCreateProperty: false,
      canEditProperty: false,
      canDeleteProperty: false,
      canPublishProperty: false,
      canViewAllUnits: false,
      canViewOwnUnits: true,
      canManageUnits: false,
      canViewContracts: true,
      canCreateContracts: false,
      canEditContracts: false,
      canDeleteContracts: false,
      canViewInvoices: true,
      canCreateInvoices: false,
      canEditInvoices: false,
      canDeleteInvoices: false,
      canProcessPayments: false,
      canViewTasks: true,
      canCreateTasks: true,
      canEditTasks: false,
      canAssignTasks: false,
      canViewUsers: false,
      canCreateUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canAssignRoles: false,
      canViewReports: false,
      canViewAnalytics: false,
      canExportData: false,
      canAccessAdmin: false,
      canManageSettings: false,
      canManagePackages: false,
      canViewAuctions: true,
      canCreateAuctions: false,
      canManageAuctions: false,
      canViewLegal: true,
      canCreateLegal: false,
      canManageLegal: false,
    }
  },

  // 2. مستأجر شركة (Corporate Tenant)
  corporate_tenant: {
    id: 'corporate_tenant',
    name: { ar: 'مستأجر شركة', en: 'Corporate Tenant' },
    description: { 
      ar: 'شركة تستأجر عدة وحدات مع إدارة موظفيها', 
      en: 'Company renting multiple units with employee management' 
    },
    dashboardPath: '/dashboard/tenant',
    profilePath: '/profile',
    maxProperties: 0,
    maxUnits: 100,
    maxUsers: 50,
    color: 'indigo',
    icon: '🏢',
    features: [
      'جميع صلاحيات المستأجر الفردي',
      'إضافة مستخدمين فرعيين (موظفين)',
      'إدارة عدة وحدات',
      'إدارة صلاحيات داخلية للموظفين',
      'تقارير إدارية للشركة'
    ],
    permissions: {
      canViewAllProperties: false,
      canViewOwnProperties: false,
      canCreateProperty: false,
      canEditProperty: false,
      canDeleteProperty: false,
      canPublishProperty: false,
      canViewAllUnits: false,
      canViewOwnUnits: true,
      canManageUnits: false,
      canViewContracts: true,
      canCreateContracts: false,
      canEditContracts: false,
      canDeleteContracts: false,
      canViewInvoices: true,
      canCreateInvoices: false,
      canEditInvoices: false,
      canDeleteInvoices: false,
      canProcessPayments: false,
      canViewTasks: true,
      canCreateTasks: true,
      canEditTasks: false,
      canAssignTasks: false,
      canViewUsers: true,
      canCreateUsers: true,
      canEditUsers: true,
      canDeleteUsers: false,
      canAssignRoles: false,
      canViewReports: true,
      canViewAnalytics: true,
      canExportData: true,
      canAccessAdmin: false,
      canManageSettings: false,
      canManagePackages: false,
      canViewAuctions: true,
      canCreateAuctions: false,
      canManageAuctions: false,
      canViewLegal: true,
      canCreateLegal: false,
      canManageLegal: false,
    }
  },

  // 3. مؤجر فردي عادي (Basic Individual Landlord)
  basic_landlord: {
    id: 'basic_landlord',
    name: { ar: 'مؤجر فردي عادي', en: 'Basic Individual Landlord' },
    description: { 
      ar: 'مالك عقار واحد إلى 3 عقارات', 
      en: 'Owner of 1 to 3 properties' 
    },
    dashboardPath: '/dashboard/property-owner',
    profilePath: '/profile',
    maxProperties: 3,
    maxUnits: 20,
    maxUsers: 5,
    color: 'green',
    icon: '🏡',
    features: [
      'إنشاء ملف شخصي',
      'رفع بيانات شخصية أو بنكية',
      'إدارة حتى 3 عقارات فقط',
      'إدارة المستأجرين',
      'تتبع المدفوعات'
    ],
    permissions: {
      canViewAllProperties: false,
      canViewOwnProperties: true,
      canCreateProperty: true,
      canEditProperty: true,
      canDeleteProperty: true,
      canPublishProperty: true,
      canViewAllUnits: false,
      canViewOwnUnits: true,
      canManageUnits: true,
      canViewContracts: true,
      canCreateContracts: true,
      canEditContracts: true,
      canDeleteContracts: true,
      canViewInvoices: true,
      canCreateInvoices: true,
      canEditInvoices: true,
      canDeleteInvoices: true,
      canProcessPayments: true,
      canViewTasks: true,
      canCreateTasks: true,
      canEditTasks: true,
      canAssignTasks: true,
      canViewUsers: true,
      canCreateUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canAssignRoles: false,
      canViewReports: true,
      canViewAnalytics: true,
      canExportData: true,
      canAccessAdmin: false,
      canManageSettings: false,
      canManagePackages: false,
      canViewAuctions: true,
      canCreateAuctions: true,
      canManageAuctions: false,
      canViewLegal: true,
      canCreateLegal: true,
      canManageLegal: true,
    }
  },

  // 4. مؤجر فردي يملك عقارات متعددة (Property-owning Individual Landlord)
  property_landlord: {
    id: 'property_landlord',
    name: { ar: 'مؤجر يملك عقارات متعددة', en: 'Property-owning Individual Landlord' },
    description: { 
      ar: 'مالك عدة عقارات مع إدارة متقدمة', 
      en: 'Owner of multiple properties with advanced management' 
    },
    dashboardPath: '/dashboard/property-owner',
    profilePath: '/profile',
    maxProperties: 25,
    maxUnits: 100,
    maxUsers: 10,
    color: 'emerald',
    icon: '🏘️',
    features: [
      'رفع عقارات للإيجار أو البيع',
      'إدارة العقود والمستأجرين',
      'تتبع المدفوعات والعوائد',
      'استقبال طلبات الصيانة وتوجيهها',
      'إرسال الإشعارات والتنبيهات',
      'تقارير مالية متقدمة'
    ],
    permissions: {
      canViewAllProperties: false,
      canViewOwnProperties: true,
      canCreateProperty: true,
      canEditProperty: true,
      canDeleteProperty: true,
      canPublishProperty: true,
      canViewAllUnits: false,
      canViewOwnUnits: true,
      canManageUnits: true,
      canViewContracts: true,
      canCreateContracts: true,
      canEditContracts: true,
      canDeleteContracts: true,
      canViewInvoices: true,
      canCreateInvoices: true,
      canEditInvoices: true,
      canDeleteInvoices: true,
      canProcessPayments: true,
      canViewTasks: true,
      canCreateTasks: true,
      canEditTasks: true,
      canAssignTasks: true,
      canViewUsers: true,
      canCreateUsers: true,
      canEditUsers: true,
      canDeleteUsers: false,
      canAssignRoles: false,
      canViewReports: true,
      canViewAnalytics: true,
      canExportData: true,
      canAccessAdmin: false,
      canManageSettings: false,
      canManagePackages: false,
      canViewAuctions: true,
      canCreateAuctions: true,
      canManageAuctions: true,
      canViewLegal: true,
      canCreateLegal: true,
      canManageLegal: true,
    }
  },

  // 5. مؤجر شركة (Corporate Landlord)
  corporate_landlord: {
    id: 'corporate_landlord',
    name: { ar: 'مؤجر شركة', en: 'Corporate Landlord' },
    description: { 
      ar: 'شركة تملك وتدير محفظة عقارية كبيرة', 
      en: 'Company owning and managing large property portfolio' 
    },
    dashboardPath: '/dashboard/corporate-landlord',
    profilePath: '/profile',
    maxProperties: 1000,
    maxUnits: 5000,
    maxUsers: 100,
    color: 'purple',
    icon: '🏗️',
    features: [
      'إدارة محفظة عقارية متعددة',
      'تعيين موظفين (مدراء، محاسبون، وسطاء)',
      'الوصول لتقارير مالية وتحليل أداء العقارات',
      'التحكم الكامل في عمليات التأجير والصيانة',
      'إدارة جمعيات الملاك',
      'نظام إدارة متقدم'
    ],
    permissions: {
      canViewAllProperties: false,
      canViewOwnProperties: true,
      canCreateProperty: true,
      canEditProperty: true,
      canDeleteProperty: true,
      canPublishProperty: true,
      canViewAllUnits: false,
      canViewOwnUnits: true,
      canManageUnits: true,
      canViewContracts: true,
      canCreateContracts: true,
      canEditContracts: true,
      canDeleteContracts: true,
      canViewInvoices: true,
      canCreateInvoices: true,
      canEditInvoices: true,
      canDeleteInvoices: true,
      canProcessPayments: true,
      canViewTasks: true,
      canCreateTasks: true,
      canEditTasks: true,
      canAssignTasks: true,
      canViewUsers: true,
      canCreateUsers: true,
      canEditUsers: true,
      canDeleteUsers: true,
      canAssignRoles: true,
      canViewReports: true,
      canViewAnalytics: true,
      canExportData: true,
      canAccessAdmin: false,
      canManageSettings: false,
      canManagePackages: false,
      canViewAuctions: true,
      canCreateAuctions: true,
      canManageAuctions: true,
      canViewLegal: true,
      canCreateLegal: true,
      canManageLegal: true,
    }
  },

  // 6. مدير عقارات فردي (Individual Property Manager)
  property_manager: {
    id: 'property_manager',
    name: { ar: 'مدير عقارات فردي', en: 'Individual Property Manager' },
    description: { 
      ar: 'مدير عقارات لعدة ملاك', 
      en: 'Property manager for multiple owners' 
    },
    dashboardPath: '/dashboard/property-manager',
    profilePath: '/profile',
    maxProperties: 50,
    maxUnits: 200,
    maxUsers: 20,
    color: 'orange',
    icon: '👨‍💼',
    features: [
      'إدارة عقارات لعدة ملاك',
      'إنشاء العقود واستلام الإيجارات',
      'التواصل مع المستأجرين',
      'جدولة الصيانة',
      'الوصول لتقارير عن الأداء',
      'إدارة المهام والمتابعة'
    ],
    permissions: {
      canViewAllProperties: false,
      canViewOwnProperties: true,
      canCreateProperty: false,
      canEditProperty: true,
      canDeleteProperty: false,
      canPublishProperty: true,
      canViewAllUnits: false,
      canViewOwnUnits: true,
      canManageUnits: true,
      canViewContracts: true,
      canCreateContracts: true,
      canEditContracts: true,
      canDeleteContracts: false,
      canViewInvoices: true,
      canCreateInvoices: true,
      canEditInvoices: true,
      canDeleteInvoices: false,
      canProcessPayments: true,
      canViewTasks: true,
      canCreateTasks: true,
      canEditTasks: true,
      canAssignTasks: true,
      canViewUsers: true,
      canCreateUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canAssignRoles: false,
      canViewReports: true,
      canViewAnalytics: true,
      canExportData: true,
      canAccessAdmin: false,
      canManageSettings: false,
      canManagePackages: false,
      canViewAuctions: true,
      canCreateAuctions: false,
      canManageAuctions: false,
      canViewLegal: true,
      canCreateLegal: false,
      canManageLegal: false,
    }
  },

  // 7. مقدم خدمة (Service Provider)
  service_provider: {
    id: 'service_provider',
    name: { ar: 'مقدم خدمة', en: 'Service Provider' },
    description: { 
      ar: 'مقدم خدمات صيانة وتنظيف للعقارات', 
      en: 'Provider of maintenance and cleaning services for properties' 
    },
    dashboardPath: '/dashboard/service-provider',
    profilePath: '/profile',
    maxProperties: 0,
    maxUnits: 0,
    maxUsers: 10,
    color: 'yellow',
    icon: '🔧',
    features: [
      'استقبال طلبات أعمال (صيانة، تنظيف)',
      'تحديث حالة الطلب (مكتمل/قيد التنفيذ)',
      'إرسال عروض أسعار',
      'عرض سجل المهام السابقة',
      'إدارة الفريق والعمال'
    ],
    permissions: {
      canViewAllProperties: false,
      canViewOwnProperties: false,
      canCreateProperty: false,
      canEditProperty: false,
      canDeleteProperty: false,
      canPublishProperty: false,
      canViewAllUnits: false,
      canViewOwnUnits: false,
      canManageUnits: false,
      canViewContracts: true,
      canCreateContracts: false,
      canEditContracts: false,
      canDeleteContracts: false,
      canViewInvoices: true,
      canCreateInvoices: true,
      canEditInvoices: false,
      canDeleteInvoices: false,
      canProcessPayments: false,
      canViewTasks: true,
      canCreateTasks: false,
      canEditTasks: true,
      canAssignTasks: true,
      canViewUsers: true,
      canCreateUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canAssignRoles: false,
      canViewReports: true,
      canViewAnalytics: false,
      canExportData: false,
      canAccessAdmin: false,
      canManageSettings: false,
      canManagePackages: false,
      canViewAuctions: false,
      canCreateAuctions: false,
      canManageAuctions: false,
      canViewLegal: false,
      canCreateLegal: false,
      canManageLegal: false,
    }
  },

  // 8. مستخدم موظف/إداري (Admin Staff)
  admin_staff: {
    id: 'admin_staff',
    name: { ar: 'موظف إداري', en: 'Admin Staff' },
    description: { 
      ar: 'موظف إداري حسب الصلاحيات الممنوحة من الشركة', 
      en: 'Administrative staff with permissions granted by company' 
    },
    dashboardPath: '/dashboard/admin-staff',
    profilePath: '/profile',
    maxProperties: 0,
    maxUnits: 0,
    maxUsers: 0,
    color: 'gray',
    icon: '👨‍💻',
    features: [
      'صلاحيات حسب ما يتم منحه من الشركة',
      'إدارة يومية للعقارات أو الطلبات أو العقود',
      'لا يملك صلاحيات ملكية',
      'تنفيذ المهام الموكلة إليه'
    ],
    permissions: {
      canViewAllProperties: false,
      canViewOwnProperties: false,
      canCreateProperty: false,
      canEditProperty: false,
      canDeleteProperty: false,
      canPublishProperty: false,
      canViewAllUnits: false,
      canViewOwnUnits: false,
      canManageUnits: false,
      canViewContracts: true,
      canCreateContracts: false,
      canEditContracts: false,
      canDeleteContracts: false,
      canViewInvoices: true,
      canCreateInvoices: false,
      canEditInvoices: false,
      canDeleteInvoices: false,
      canProcessPayments: false,
      canViewTasks: true,
      canCreateTasks: false,
      canEditTasks: false,
      canAssignTasks: false,
      canViewUsers: false,
      canCreateUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canAssignRoles: false,
      canViewReports: false,
      canViewAnalytics: false,
      canExportData: false,
      canAccessAdmin: false,
      canManageSettings: false,
      canManagePackages: false,
      canViewAuctions: false,
      canCreateAuctions: false,
      canManageAuctions: false,
      canViewLegal: false,
      canCreateLegal: false,
      canManageLegal: false,
    }
  },

  // 9. وسيط عقاري (Real Estate Agent/Broker)
  real_estate_agent: {
    id: 'real_estate_agent',
    name: { ar: 'وسيط عقاري', en: 'Real Estate Agent/Broker' },
    description: { 
      ar: 'وسيط عقاري للتفاوض وإدارة العقارات', 
      en: 'Real estate agent for negotiation and property management' 
    },
    dashboardPath: '/dashboard/agent',
    profilePath: '/profile',
    maxProperties: 100,
    maxUnits: 500,
    maxUsers: 5,
    color: 'pink',
    icon: '🤝',
    features: [
      'رفع عقارات بالنيابة عن المالكين',
      'جدولة زيارات',
      'التفاوض وإدارة التواصل بين الأطراف',
      'تتبع العمولات والصفقات',
      'إدارة قاعدة بيانات العملاء'
    ],
    permissions: {
      canViewAllProperties: true,
      canViewOwnProperties: true,
      canCreateProperty: true,
      canEditProperty: true,
      canDeleteProperty: false,
      canPublishProperty: true,
      canViewAllUnits: true,
      canViewOwnUnits: true,
      canManageUnits: true,
      canViewContracts: true,
      canCreateContracts: true,
      canEditContracts: true,
      canDeleteContracts: false,
      canViewInvoices: true,
      canCreateInvoices: true,
      canEditInvoices: false,
      canDeleteInvoices: false,
      canProcessPayments: false,
      canViewTasks: true,
      canCreateTasks: true,
      canEditTasks: true,
      canAssignTasks: false,
      canViewUsers: true,
      canCreateUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canAssignRoles: false,
      canViewReports: true,
      canViewAnalytics: true,
      canExportData: true,
      canAccessAdmin: false,
      canManageSettings: false,
      canManagePackages: false,
      canViewAuctions: true,
      canCreateAuctions: true,
      canManageAuctions: false,
      canViewLegal: true,
      canCreateLegal: false,
      canManageLegal: false,
    }
  },

  // 10. مستثمر (Investor)
  investor: {
    id: 'investor',
    name: { ar: 'مستثمر', en: 'Investor' },
    description: { 
      ar: 'مستثمر عقاري يتابع العوائد والأداء', 
      en: 'Real estate investor tracking returns and performance' 
    },
    dashboardPath: '/dashboard/investor',
    profilePath: '/profile',
    maxProperties: 0,
    maxUnits: 0,
    maxUsers: 1,
    color: 'cyan',
    icon: '📈',
    features: [
      'عرض التقارير المالية',
      'تتبع العوائد والإشغال',
      'لا يمكنه التعديل أو الإدارة اليومية',
      'متابعة أداء الاستثمارات',
      'تحليلات السوق'
    ],
    permissions: {
      canViewAllProperties: false,
      canViewOwnProperties: true,
      canCreateProperty: false,
      canEditProperty: false,
      canDeleteProperty: false,
      canPublishProperty: false,
      canViewAllUnits: false,
      canViewOwnUnits: true,
      canManageUnits: false,
      canViewContracts: true,
      canCreateContracts: false,
      canEditContracts: false,
      canDeleteContracts: false,
      canViewInvoices: true,
      canCreateInvoices: false,
      canEditInvoices: false,
      canDeleteInvoices: false,
      canProcessPayments: false,
      canViewTasks: false,
      canCreateTasks: false,
      canEditTasks: false,
      canAssignTasks: false,
      canViewUsers: false,
      canCreateUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canAssignRoles: false,
      canViewReports: true,
      canViewAnalytics: true,
      canExportData: true,
      canAccessAdmin: false,
      canManageSettings: false,
      canManagePackages: false,
      canViewAuctions: true,
      canCreateAuctions: false,
      canManageAuctions: false,
      canViewLegal: false,
      canCreateLegal: false,
      canManageLegal: false,
    }
  },

  // 11. مستخدم فرعي (Sub-user)
  sub_user: {
    id: 'sub_user',
    name: { ar: 'مستخدم فرعي', en: 'Sub-user' },
    description: { 
      ar: 'مستخدم فرعي تابع لمستخدم رئيسي', 
      en: 'Sub-user dependent on main user' 
    },
    dashboardPath: '/dashboard/sub-user',
    profilePath: '/profile',
    maxProperties: 0,
    maxUnits: 0,
    maxUsers: 0,
    color: 'slate',
    icon: '👤',
    features: [
      'صلاحيات محددة من المستخدم الرئيسي',
      'عرض، تعديل، متابعة معينة',
      'لا يملك صلاحيات مستقلة',
      'تنفيذ المهام الموكلة'
    ],
    permissions: {
      canViewAllProperties: false,
      canViewOwnProperties: false,
      canCreateProperty: false,
      canEditProperty: false,
      canDeleteProperty: false,
      canPublishProperty: false,
      canViewAllUnits: false,
      canViewOwnUnits: false,
      canManageUnits: false,
      canViewContracts: false,
      canCreateContracts: false,
      canEditContracts: false,
      canDeleteContracts: false,
      canViewInvoices: false,
      canCreateInvoices: false,
      canEditInvoices: false,
      canDeleteInvoices: false,
      canProcessPayments: false,
      canViewTasks: false,
      canCreateTasks: false,
      canEditTasks: false,
      canAssignTasks: false,
      canViewUsers: false,
      canCreateUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canAssignRoles: false,
      canViewReports: false,
      canViewAnalytics: false,
      canExportData: false,
      canAccessAdmin: false,
      canManageSettings: false,
      canManagePackages: false,
      canViewAuctions: false,
      canCreateAuctions: false,
      canManageAuctions: false,
      canViewLegal: false,
      canCreateLegal: false,
      canManageLegal: false,
    }
  },

  // 12. ضيف (Guest)
  guest: {
    id: 'guest',
    name: { ar: 'ضيف', en: 'Guest' },
    description: { 
      ar: 'زائر للموقع بدون حساب', 
      en: 'Website visitor without account' 
    },
    dashboardPath: '/',
    profilePath: '/',
    maxProperties: 0,
    maxUnits: 0,
    maxUsers: 0,
    color: 'gray',
    icon: '👋',
    features: [
      'تصفح العقارات المتاحة',
      'إرسال طلب تواصل أو استفسار',
      'لا يمكنه التفاعل مع العقود أو البيانات'
    ],
    permissions: {
      canViewAllProperties: false,
      canViewOwnProperties: false,
      canCreateProperty: false,
      canEditProperty: false,
      canDeleteProperty: false,
      canPublishProperty: false,
      canViewAllUnits: false,
      canViewOwnUnits: false,
      canManageUnits: false,
      canViewContracts: false,
      canCreateContracts: false,
      canEditContracts: false,
      canDeleteContracts: false,
      canViewInvoices: false,
      canCreateInvoices: false,
      canEditInvoices: false,
      canDeleteInvoices: false,
      canProcessPayments: false,
      canViewTasks: false,
      canCreateTasks: false,
      canEditTasks: false,
      canAssignTasks: false,
      canViewUsers: false,
      canCreateUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canAssignRoles: false,
      canViewReports: false,
      canViewAnalytics: false,
      canExportData: false,
      canAccessAdmin: false,
      canManageSettings: false,
      canManagePackages: false,
      canViewAuctions: true,
      canCreateAuctions: false,
      canManageAuctions: false,
      canViewLegal: false,
      canCreateLegal: false,
      canManageLegal: false,
    }
  },

  // 13. إدارة الموقع (Site Admin)
  site_admin: {
    id: 'site_admin',
    name: { ar: 'إدارة الموقع', en: 'Site Admin' },
    description: { 
      ar: 'مدير الموقع مع صلاحيات التحكم الكاملة', 
      en: 'Site administrator with full control permissions' 
    },
    dashboardPath: '/dashboard/admin',
    profilePath: '/profile',
    maxProperties: Infinity,
    maxUnits: Infinity,
    maxUsers: Infinity,
    color: 'red',
    icon: '🛡️',
    features: [
      'التحكم في كل مفاصل الموقع وأقسامه',
      'إدارة المستخدمين والباقات',
      'إدارة جميع العقارات والوحدات',
      'إدارة النظام بالكامل',
      'إعدادات الموقع والتقارير'
    ],
    permissions: {
      canViewAllProperties: true,
      canViewOwnProperties: true,
      canCreateProperty: true,
      canEditProperty: true,
      canDeleteProperty: true,
      canPublishProperty: true,
      canViewAllUnits: true,
      canViewOwnUnits: true,
      canManageUnits: true,
      canViewContracts: true,
      canCreateContracts: true,
      canEditContracts: true,
      canDeleteContracts: true,
      canViewInvoices: true,
      canCreateInvoices: true,
      canEditInvoices: true,
      canDeleteInvoices: true,
      canProcessPayments: true,
      canViewTasks: true,
      canCreateTasks: true,
      canEditTasks: true,
      canAssignTasks: true,
      canViewUsers: true,
      canCreateUsers: true,
      canEditUsers: true,
      canDeleteUsers: true,
      canAssignRoles: true,
      canViewReports: true,
      canViewAnalytics: true,
      canExportData: true,
      canAccessAdmin: true,
      canManageSettings: true,
      canManagePackages: true,
      canViewAuctions: true,
      canCreateAuctions: true,
      canManageAuctions: true,
      canViewLegal: true,
      canCreateLegal: true,
      canManageLegal: true,
    }
  },

  // 14. الوكالة العقارية (Agency)
  agency: {
    id: 'agency',
    name: { ar: 'الوكالة العقارية', en: 'Real Estate Agency' },
    description: { 
      ar: 'وكالة عقارية مع فريق من الوسطاء', 
      en: 'Real estate agency with team of brokers' 
    },
    dashboardPath: '/dashboard/agency',
    profilePath: '/profile',
    maxProperties: 200,
    maxUnits: 1000,
    maxUsers: 50,
    color: 'violet',
    icon: '🏛️',
    features: [
      'إدارة فريق من الوسطاء',
      'إدارة محفظة عقارية كبيرة',
      'تقارير مالية وإدارية',
      'إدارة العمولات والصفقات',
      'تدريب وإدارة الموظفين'
    ],
    permissions: {
      canViewAllProperties: true,
      canViewOwnProperties: true,
      canCreateProperty: true,
      canEditProperty: true,
      canDeleteProperty: false,
      canPublishProperty: true,
      canViewAllUnits: true,
      canViewOwnUnits: true,
      canManageUnits: true,
      canViewContracts: true,
      canCreateContracts: true,
      canEditContracts: true,
      canDeleteContracts: false,
      canViewInvoices: true,
      canCreateInvoices: true,
      canEditInvoices: true,
      canDeleteInvoices: false,
      canProcessPayments: true,
      canViewTasks: true,
      canCreateTasks: true,
      canEditTasks: true,
      canAssignTasks: true,
      canViewUsers: true,
      canCreateUsers: true,
      canEditUsers: true,
      canDeleteUsers: false,
      canAssignRoles: true,
      canViewReports: true,
      canViewAnalytics: true,
      canExportData: true,
      canAccessAdmin: false,
      canManageSettings: false,
      canManagePackages: false,
      canViewAuctions: true,
      canCreateAuctions: true,
      canManageAuctions: true,
      canViewLegal: true,
      canCreateLegal: true,
      canManageLegal: true,
    }
  },

  // 15. جمعية الملاك (HOA)
  hoa: {
    id: 'hoa',
    name: { ar: 'جمعية الملاك', en: 'Homeowners Association' },
    description: { 
      ar: 'جمعية إدارة مجمع سكني أو تجاري', 
      en: 'Association managing residential or commercial complex' 
    },
    dashboardPath: '/dashboard/hoa',
    profilePath: '/profile',
    maxProperties: 10,
    maxUnits: 500,
    maxUsers: 20,
    color: 'teal',
    icon: '🏘️',
    features: [
      'إدارة مجمع سكني أو تجاري',
      'إدارة الرسوم المشتركة',
      'إدارة الصيانة المشتركة',
      'إدارة القرارات والتصويتات',
      'التواصل مع الملاك'
    ],
    permissions: {
      canViewAllProperties: false,
      canViewOwnProperties: true,
      canCreateProperty: false,
      canEditProperty: true,
      canDeleteProperty: false,
      canPublishProperty: false,
      canViewAllUnits: false,
      canViewOwnUnits: true,
      canManageUnits: true,
      canViewContracts: true,
      canCreateContracts: true,
      canEditContracts: true,
      canDeleteContracts: false,
      canViewInvoices: true,
      canCreateInvoices: true,
      canEditInvoices: true,
      canDeleteInvoices: false,
      canProcessPayments: true,
      canViewTasks: true,
      canCreateTasks: true,
      canEditTasks: true,
      canAssignTasks: true,
      canViewUsers: true,
      canCreateUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canAssignRoles: false,
      canViewReports: true,
      canViewAnalytics: true,
      canExportData: true,
      canAccessAdmin: false,
      canManageSettings: false,
      canManagePackages: false,
      canViewAuctions: false,
      canCreateAuctions: false,
      canManageAuctions: false,
      canViewLegal: true,
      canCreateLegal: true,
      canManageLegal: false,
    }
  },

  // 16. المطور العقاري (Developer)
  developer: {
    id: 'developer',
    name: { ar: 'المطور العقاري', en: 'Real Estate Developer' },
    description: { 
      ar: 'مطور عقاري لمشاريع التطوير والبناء', 
      en: 'Real estate developer for development and construction projects' 
    },
    dashboardPath: '/dashboard/developer',
    profilePath: '/profile',
    maxProperties: 500,
    maxUnits: 2000,
    maxUsers: 100,
    color: 'amber',
    icon: '🏗️',
    features: [
      'إدارة مشاريع التطوير العقاري',
      'إدارة مراحل البناء والتسليم',
      'إدارة المبيعات والإيجارات',
      'تتبع التقدم المالي',
      'إدارة الفريق والمقاولين'
    ],
    permissions: {
      canViewAllProperties: false,
      canViewOwnProperties: true,
      canCreateProperty: true,
      canEditProperty: true,
      canDeleteProperty: true,
      canPublishProperty: true,
      canViewAllUnits: false,
      canViewOwnUnits: true,
      canManageUnits: true,
      canViewContracts: true,
      canCreateContracts: true,
      canEditContracts: true,
      canDeleteContracts: true,
      canViewInvoices: true,
      canCreateInvoices: true,
      canEditInvoices: true,
      canDeleteInvoices: true,
      canProcessPayments: true,
      canViewTasks: true,
      canCreateTasks: true,
      canEditTasks: true,
      canAssignTasks: true,
      canViewUsers: true,
      canCreateUsers: true,
      canEditUsers: true,
      canDeleteUsers: true,
      canAssignRoles: true,
      canViewReports: true,
      canViewAnalytics: true,
      canExportData: true,
      canAccessAdmin: false,
      canManageSettings: false,
      canManagePackages: false,
      canViewAuctions: true,
      canCreateAuctions: true,
      canManageAuctions: true,
      canViewLegal: true,
      canCreateLegal: true,
      canManageLegal: true,
    }
  }
};

// دوال مساعدة
export function getUserRoleConfig(role: UserRole): UserRoleConfig | null {
  return USER_ROLES[role] || null;
}

export function getAllRoles(): UserRoleConfig[] {
  return Object.values(USER_ROLES);
}

export function getRolePermissions(role: UserRole): UserPermissions | null {
  return USER_ROLES[role]?.permissions || null;
}

export function hasPermission(role: UserRole, permission: keyof UserPermissions): boolean {
  const permissions = getRolePermissions(role);
  return permissions ? permissions[permission] : false;
}

export function getDashboardPath(role: UserRole): string {
  return USER_ROLES[role]?.dashboardPath || '/dashboard';
}

export function getProfilePath(role: UserRole): string {
  return USER_ROLES[role]?.profilePath || '/profile';
}

export function getRoleColor(role: UserRole): string {
  return USER_ROLES[role]?.color || 'gray';
}

export function getRoleIcon(role: UserRole): string {
  return USER_ROLES[role]?.icon || '👤';
}

export function getRoleName(role: UserRole, lang: 'ar' | 'en' = 'ar'): string {
  return USER_ROLES[role]?.name[lang] || role;
}

export function getRoleDescription(role: UserRole, lang: 'ar' | 'en' = 'ar'): string {
  return USER_ROLES[role]?.description[lang] || '';
}

export function getRoleFeatures(role: UserRole): string[] {
  return USER_ROLES[role]?.features || [];
}

export function getMaxProperties(role: UserRole): number {
  return USER_ROLES[role]?.maxProperties || 0;
}

export function getMaxUnits(role: UserRole): number {
  return USER_ROLES[role]?.maxUnits || 0;
}

export function getMaxUsers(role: UserRole): number {
  return USER_ROLES[role]?.maxUsers || 0;
}

// تصدير الأدوار كقائمة
export const ROLE_LIST = Object.keys(USER_ROLES) as UserRole[];

// تصدير الأدوار الأساسية
export const BASIC_ROLES: UserRole[] = [
  'individual_tenant',
  'basic_landlord', 
  'property_landlord',
  'corporate_landlord',
  'site_admin'
];

// تصدير الأدوار المتقدمة
export const ADVANCED_ROLES: UserRole[] = [
  'property_manager',
  'real_estate_agent',
  'agency',
  'developer',
  'investor'
];

// تصدير أدوار الخدمات
export const SERVICE_ROLES: UserRole[] = [
  'service_provider',
  'admin_staff',
  'sub_user'
];
