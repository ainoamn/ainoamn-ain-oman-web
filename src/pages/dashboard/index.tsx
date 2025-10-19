// src/pages/dashboard/index.tsx - نظام التوجيه التلقائي للوحات التحكم
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { 
  FiUsers, FiShield, FiHome, FiUser, FiGlobe,
  FiArrowRight, FiCheck, FiX, FiClock, FiStar, FiActivity
} from 'react-icons/fi';
import { 
  USER_ROLES, 
  UserRole, 
  getUserRoleConfig,
  getRoleName,
  getRoleIcon,
  getRoleColor,
  getRoleFeatures,
  getDashboardPath,
  hasPermission,
  getAllRoles
} from '@/lib/user-roles';
import { getCurrentUser } from '@/lib/rbac';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  company?: string;
  subscription?: {
    planName: string;
    status: 'active' | 'expired' | 'cancelled';
    expiryDate: string;
    remainingDays: number;
  };
  lastLogin?: string;
  loginCount?: number;
}

export default function DashboardRouter() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRedirect, setAutoRedirect] = useState(true);
  const [availableDashboards, setAvailableDashboards] = useState<any[]>([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // جلب بيانات المستخدم من localStorage
      const authData = localStorage.getItem('ain_auth');
      
      if (authData) {
        const userData = JSON.parse(authData);
        setUser(userData);
        generateAvailableDashboards(userData);

        // التوجيه التلقائي بعد 2 ثانية
        if (autoRedirect) {
          setTimeout(() => {
            const dashboardPath = getDashboardPath(userData.role);
            router.push(dashboardPath);
          }, 2000);
        }
      } else {
        // المستخدم غير مسجل دخول - التوجيه لصفحة تسجيل الدخول
        router.push('/login');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // في حالة الخطأ، التوجيه لصفحة تسجيل الدخول
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const generateAvailableDashboards = (userData: User | null) => {
    const dashboards = [];

    if (!userData) {
      setAvailableDashboards([]);
      return;
    }

    // لوحة الإدارة - للمديرين فقط
    if (userData.role === 'site_admin' || userData.role === 'company_admin') {
      dashboards.push({
    id: 'admin',
    title: 'إدارة النظام الكاملة',
    description: 'لوحة تحكم شاملة لإدارة الموقع بالكامل',
        icon: <FiShield className="text-4xl text-red-600" />,
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    features: [
      'إدارة المستخدمين والأذونات',
      'مراقبة النظام والأداء',
      'إدارة جميع العقارات',
      'إدارة جميع الحجوزات',
      'التحليلات والتقارير',
      'إعدادات النظام'
    ],
        link: '/dashboard/admin',
        permission: 'canAccessAdmin'
      });
    }

    // لوحة المالك - للملاك والمطورين والشركات
    if (['property_owner', 'property_landlord', 'basic_landlord', 'corporate_landlord', 'developer'].includes(userData.role)) {
      dashboards.push({
	id: 'property-owner',
        title: 'إدارة العقارات',
        description: 'لوحة تحكم لإدارة عقاراتك ومستأجريك',
        icon: <FiHome className="text-4xl text-green-600" />,
	color: 'bg-green-500',
	bgColor: 'bg-green-50',
	textColor: 'text-green-600',
	features: [
	  'إدارة عقاراتك',
	  'مراجعة الحجوزات',
          'إدارة المستأجرين',
	  'التحليلات المالية',
	  'إدارة المهام',
	  'التقارير والإحصائيات'
	],
        link: '/dashboard/owner',
        permission: 'canViewOwnProperties'
      });
    }

    // لوحة مدير العقار
    if (userData.role === 'property_manager') {
      dashboards.push({
        id: 'property-manager',
        title: 'إدارة العقارات',
        description: 'لوحة تحكم لإدارة العقارات المسندة إليك',
        icon: <FiHome className="text-4xl text-orange-600" />,
        color: 'bg-orange-500',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-600',
        features: [
          'إدارة العقارات المسندة',
          'التواصل مع المستأجرين',
          'جدولة الصيانة',
          'تتبع الأداء',
          'إدارة المهام',
          'التقارير'
        ],
        link: '/dashboard/property-manager',
        permission: 'canViewOwnProperties'
      });
    }

    // لوحة المحاسب
    if (userData.role === 'accountant') {
      dashboards.push({
        id: 'accountant',
        title: 'النظام المالي',
        description: 'لوحة تحكم المحاسبة والمالية',
        icon: <FiDollarSign className="text-4xl text-green-600" />,
        color: 'bg-green-500',
        bgColor: 'bg-green-50',
        textColor: 'text-green-600',
        features: [
          'إدارة الفواتير',
          'إدارة الشيكات',
          'التقارير المالية',
          'تصدير البيانات'
        ],
        link: '/dashboard/accountant',
        permission: 'view_financial'
      });
    }

    // لوحة المستشار القانوني
    if (userData.role === 'legal_advisor') {
      dashboards.push({
        id: 'legal',
        title: 'النظام القانوني',
        description: 'لوحة تحكم القضايا القانونية',
        icon: <FiFileText className="text-4xl text-red-600" />,
        color: 'bg-red-500',
        bgColor: 'bg-red-50',
        textColor: 'text-red-600',
        features: [
          'إدارة القضايا',
          'العقود',
          'الاستشارات'
        ],
        link: '/dashboard/legal',
        permission: 'view_legal'
      });
    }

    // لوحة المبيعات
    if (userData.role === 'sales_agent') {
      dashboards.push({
        id: 'sales',
        title: 'المبيعات',
        description: 'لوحة تحكم المبيعات والتسويق',
        icon: <FiTrendingUp className="text-4xl text-blue-600" />,
        color: 'bg-blue-500',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
        features: [
          'عرض العقارات',
          'إضافة عقارات',
          'إدارة المهام'
        ],
        link: '/dashboard/sales',
        permission: 'view_properties'
      });
    }

    // لوحة الصيانة
    if (userData.role === 'maintenance_staff') {
      dashboards.push({
        id: 'maintenance',
        title: 'الصيانة',
        description: 'لوحة تحكم طلبات الصيانة',
        icon: <FiSettings className="text-4xl text-purple-600" />,
        color: 'bg-purple-500',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-600',
        features: [
          'طلبات الصيانة',
          'المهام المسندة'
        ],
        link: '/dashboard/maintenance',
        permission: 'view_maintenance'
      });
    }

    // لوحة المستأجر والعميل
    if (['tenant', 'individual_tenant', 'customer_viewer'].includes(userData.role)) {
      dashboards.push({
        id: 'tenant',
        title: 'لوحة المستأجر',
        description: 'لوحة تحكم لإدارة وحدتك وخدماتك',
        icon: <FiUser className="text-4xl text-blue-600" />,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    features: [
          'عرض عقد الإيجار',
          'دفع الفواتير والإيجارات',
          'إرسال طلبات صيانة',
          'استلام الإشعارات',
      'تتبع المعاملات',
          'الرسائل والتواصل'
        ],
        link: '/dashboard/tenant',
        permission: 'canViewContracts'
      });
    }

    // لوحة المستأجر الشركة
    if (userData.role === 'corporate_tenant') {
      dashboards.push({
        id: 'corporate-tenant',
        title: 'لوحة المستأجر الشركة',
        description: 'لوحة تحكم لإدارة وحدات الشركة وموظفيها',
        icon: <FiHome className="text-4xl text-indigo-600" />,
        color: 'bg-indigo-500',
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-600',
        features: [
          'إدارة عدة وحدات',
          'إضافة مستخدمين فرعيين',
          'إدارة صلاحيات الموظفين',
          'تقارير إدارية',
          'إدارة الفواتير',
          'التواصل مع الإدارة'
        ],
        link: '/dashboard/corporate-tenant',
        permission: 'canViewUsers'
      });
    }

    // لوحة الوسيط العقاري
    if (userData.role === 'real_estate_agent') {
      dashboards.push({
        id: 'agent',
        title: 'لوحة الوسيط العقاري',
        description: 'لوحة تحكم لإدارة العقارات والعملاء',
        icon: <FiGlobe className="text-4xl text-pink-600" />,
        color: 'bg-pink-500',
        bgColor: 'bg-pink-50',
        textColor: 'text-pink-600',
        features: [
          'رفع عقارات بالنيابة',
          'جدولة زيارات',
          'التفاوض مع الأطراف',
          'تتبع العمولات',
          'إدارة قاعدة العملاء',
          'تقارير المبيعات'
        ],
        link: '/dashboard/agent',
        permission: 'canViewAllProperties'
      });
    }

    // لوحة الوكالة العقارية
    if (userData.role === 'agency') {
      dashboards.push({
        id: 'agency',
        title: 'لوحة الوكالة العقارية',
        description: 'لوحة تحكم لإدارة فريق الوسطاء والعقارات',
        icon: <FiHome className="text-4xl text-violet-600" />,
        color: 'bg-violet-500',
        bgColor: 'bg-violet-50',
        textColor: 'text-violet-600',
        features: [
          'إدارة فريق الوسطاء',
          'إدارة محفظة عقارية كبيرة',
          'تقارير مالية وإدارية',
          'إدارة العمولات',
          'تدريب الموظفين',
          'تحليل الأداء'
        ],
        link: '/dashboard/agency',
        permission: 'canViewUsers'
      });
    }

    // لوحة المطور العقاري
    if (userData.role === 'developer') {
      dashboards.push({
        id: 'developer',
        title: 'لوحة المطور العقاري',
        description: 'لوحة تحكم لمشاريع التطوير والبناء',
        icon: <FiHome className="text-4xl text-amber-600" />,
        color: 'bg-amber-500',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-600',
        features: [
          'إدارة مشاريع التطوير',
          'إدارة مراحل البناء',
          'إدارة المبيعات والإيجارات',
          'تتبع التقدم المالي',
          'إدارة الفريق',
          'تقارير المشروع'
        ],
        link: '/dashboard/developer',
        permission: 'canCreateProperty'
      });
    }

    // لوحة المستثمر
    if (userData.role === 'investor') {
      dashboards.push({
        id: 'investor',
        title: 'لوحة المستثمر',
        description: 'لوحة تحكم لمتابعة الاستثمارات والعوائد',
        icon: <FiActivity className="text-4xl text-cyan-600" />,
        color: 'bg-cyan-500',
        bgColor: 'bg-cyan-50',
        textColor: 'text-cyan-600',
        features: [
          'عرض التقارير المالية',
          'تتبع العوائد والإشغال',
          'متابعة أداء الاستثمارات',
          'تحليلات السوق',
          'تقارير الأداء',
          'البيانات المالية'
        ],
        link: '/dashboard/investor',
        permission: 'canViewReports'
      });
    }

    // لوحة مقدم الخدمة
    if (userData.role === 'service_provider') {
      dashboards.push({
        id: 'service-provider',
        title: 'لوحة مقدم الخدمة',
        description: 'لوحة تحكم لإدارة طلبات العمل والخدمات',
        icon: <FiActivity className="text-4xl text-yellow-600" />,
        color: 'bg-yellow-500',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-600',
        features: [
          'استقبال طلبات العمل',
          'تحديث حالة الطلبات',
          'إرسال عروض أسعار',
          'عرض سجل المهام',
          'إدارة الفريق',
          'تقارير الأداء'
        ],
        link: '/dashboard/service-provider',
        permission: 'canViewTasks'
      });
    }

    // لوحة جمعية الملاك
    if (userData.role === 'hoa') {
      dashboards.push({
        id: 'hoa',
        title: 'لوحة جمعية الملاك',
        description: 'لوحة تحكم لإدارة المجمع السكني',
        icon: <FiHome className="text-4xl text-teal-600" />,
        color: 'bg-teal-500',
        bgColor: 'bg-teal-50',
        textColor: 'text-teal-600',
        features: [
          'إدارة المجمع السكني',
          'إدارة الرسوم المشتركة',
          'إدارة الصيانة المشتركة',
          'إدارة القرارات',
          'التواصل مع الملاك',
          'تقارير الإدارة'
        ],
        link: '/dashboard/hoa',
        permission: 'canViewOwnProperties'
      });
    }

    setAvailableDashboards(dashboards);
  };

  const handleDashboardSelect = (dashboardLink: string) => {
    router.push(dashboardLink);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-OM', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <FiUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد مستخدم</h3>
          <p className="text-gray-500">يرجى تسجيل الدخول أولاً</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  const roleConfig = getUserRoleConfig(user.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Head>
        <title>لوحات التحكم - عين عُمان</title>
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FiUsers className="text-blue-600" />
                لوحات التحكم
              </h1>
              <p className="text-gray-600 mt-1">
                {user ? `مرحباً ${user.name}` : 'اختر نوع لوحة التحكم المناسبة لك'}
              </p>
              {user.subscription && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {user.subscription.planName} - {user.subscription.remainingDays} يوم متبقي
                  </span>
                </div>
              )}
          </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">📊</span>
        </div>
      </div>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* User Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  className="h-16 w-16 rounded-full object-cover border-4 border-white shadow-lg"
                  src={user.avatar || '/default-avatar.png'}
                  alt={user.name}
                />
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                  <FiCheck className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl">{roleConfig?.icon}</span>
                  <span className="text-lg font-medium text-gray-700">{roleConfig?.name.ar}</span>
                </div>
                {user.company && (
                  <p className="text-gray-600">{user.company}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">آخر تسجيل دخول</div>
              <div className="font-medium">{user.lastLogin ? formatDate(user.lastLogin) : 'غير محدد'}</div>
              <div className="text-sm text-gray-500">{user.loginCount} تسجيل دخول</div>
            </div>
          </div>
        </div>

        {/* Auto Redirect Notice */}
        {autoRedirect && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiClock className="text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">توجيه تلقائي</h3>
                  <p className="text-blue-700 text-sm">سيتم توجيهك إلى لوحة التحكم الخاصة بك خلال ثوانٍ قليلة...</p>
                </div>
              </div>
              <button
                onClick={() => setAutoRedirect(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                <FiX />
              </button>
            </div>
          </div>
        )}

        {/* Available Dashboards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {availableDashboards.map((dashboard) => (
            <div
              key={dashboard.id}
              className={`${dashboard.bgColor} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 cursor-pointer`}
              onClick={() => handleDashboardSelect(dashboard.link)}
            >
              <div className="p-8">
                {/* Icon */}
                <div className={`${dashboard.color} w-20 h-20 rounded-2xl flex items-center justify-center text-white mb-6`}>
                  {dashboard.icon}
                </div>

                {/* Title and Description */}
                <h3 className={`text-2xl font-bold ${dashboard.textColor} mb-3`}>
                  {dashboard.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {dashboard.description}
                </p>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {dashboard.features.slice(0, 4).map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <FiCheck className={`w-4 h-4 ${dashboard.textColor}`} />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                  {dashboard.features.length > 4 && (
                    <div className="text-sm text-gray-500">
                      و {dashboard.features.length - 4} ميزة أخرى...
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${dashboard.textColor}`}>
                    لوحة التحكم
                  </span>
                  <FiArrowRight className={`w-5 h-5 ${dashboard.textColor}`} />
                </div>
                </div>
              </div>
            ))}
          </div>

        {/* No Dashboards Available */}
        {availableDashboards.length === 0 && (
          <div className="text-center py-12">
            <FiUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد لوحات متاحة</h3>
            <p className="text-gray-500">
              لا توجد لوحات تحكم متاحة لدورك الحالي. يرجى التواصل مع الإدارة.
            </p>
          </div>
        )}

        {/* Role Information */}
        {roleConfig && (
          <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">معلومات الدور</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">الميزات المتاحة</h4>
                <div className="space-y-2">
                  {roleConfig.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <FiCheck className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">{feature}</span>
                </div>
                  ))}
          </div>
            </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">الحدود المسموحة</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>العقارات: {roleConfig.maxProperties === Infinity ? 'غير محدود' : roleConfig.maxProperties}</div>
                  <div>الوحدات: {roleConfig.maxUnits === Infinity ? 'غير محدود' : roleConfig.maxUnits}</div>
                  <div>المستخدمين: {roleConfig.maxUsers === Infinity ? 'غير محدود' : roleConfig.maxUsers}</div>
              </div>
            </div>
            </div>
          </div>
        )}
        </main>
    </div>
  );
}
