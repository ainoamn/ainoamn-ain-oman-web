// src/pages/profile/index.tsx - البروفايل الموحد مع نظام الأدوار
import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiShield,
  FiEdit, FiSettings, FiBell, FiHeart, FiEye, FiBarChart,
  FiChevronDown, FiChevronUp, FiPlus, FiExternalLink,
  FiHome, FiUsers, FiFileText, FiDollarSign,
  FiCheckCircle, FiAlertCircle, FiClock, FiTrendingUp,
  FiActivity, FiTarget, FiAward, FiZap, FiStar, FiGlobe
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
  hasPermission
} from '@/lib/user-roles';
import { getCurrentUser, filterPropertiesByRole, filterUnitsByRole, filterTasksByRole, filterInvoicesByRole, filterBookingsByRole } from '@/lib/rbac';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  company?: string;
  location?: string;
  subscription?: {
    planName: string;
    status: 'active' | 'expired' | 'cancelled';
    expiryDate: string;
    remainingDays: number;
  };
  stats?: {
    properties: number;
    units: number;
    bookings: number;
    revenue: number;
    tasks: number;
    legalCases: number;
  };
  permissions?: string[];
  lastLogin?: string;
  loginCount?: number;
  ipAddress?: string;
  userAgent?: string;
  documents?: Array<{
    type: string;
    name: string;
    url: string;
    verified: boolean;
  }>;
}

interface ExpandedSections {
  quickActions: boolean;
  notifications: boolean;
  tasks: boolean;
  legal: boolean;
  properties: boolean;
  rentals: boolean;
  invoices: boolean;
  analytics: boolean;
}

interface AIInsights {
  performanceScore: number;
  recommendations: Array<{
    type: 'success' | 'warning' | 'info';
    title: string;
    description: string;
    action?: string;
  }>;
  nextActions: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    link: string;
  }>;
  trends: Array<{
    metric: string;
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    quickActions: true,
    notifications: false,
    tasks: false,
    legal: false,
    properties: false,
    rentals: false,
    invoices: false,
    analytics: false
  });
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // محاكاة بيانات المستخدم
      const mockUser: User = {
        id: '1',
        name: 'أحمد محمد السالمي',
        email: 'ahmed@example.com',
        phone: '+968 9123 4567',
        role: 'property_landlord',
        avatar: '/avatars/ahmed.jpg',
        company: 'شركة السالمي العقارية',
        location: 'مسقط، سلطنة عُمان',
        subscription: {
          planName: 'الخطة المعيارية',
          status: 'active',
          expiryDate: '2025-12-31',
          remainingDays: 350
        },
        stats: {
          properties: 12,
          units: 45,
          bookings: 23,
          revenue: 15420.50,
          tasks: 8,
          legalCases: 2
        },
        permissions: [
          'إدارة العقارات',
          'إدارة الحجوزات',
          'إدارة الفواتير',
          'إدارة المهام',
          'التقارير المالية'
        ],
        lastLogin: '2025-01-15T10:30:00Z',
        loginCount: 156,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        documents: [
          { type: 'id', name: 'بطاقة الهوية', url: '/docs/ahmed_id.pdf', verified: true },
          { type: 'license', name: 'رخصة تجارية', url: '/docs/ahmed_license.pdf', verified: true },
          { type: 'bank', name: 'البيانات البنكية', url: '/docs/ahmed_bank.pdf', verified: true }
        ]
      };

      setUser(mockUser);
      generateAIInsights(mockUser);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = (userData: User) => {
    const insights: AIInsights = {
      performanceScore: 87,
      recommendations: [
        {
          type: 'success',
          title: 'أداء ممتاز!',
          description: 'تحقق من 87% من أهدافك الشهرية. استمر في العمل الرائع!'
        },
        {
          type: 'warning',
          title: 'تحسين الإشغال',
          description: 'لديك 3 وحدات شاغرة. جرب خفض الأسعار بنسبة 10% لزيادة الطلب.',
          action: 'تعديل الأسعار'
        },
        {
          type: 'info',
          title: 'تحديث المستندات',
          description: 'تأكد من تحديث رخصة التاجر قبل انتهاء صلاحيتها.'
        }
      ],
      nextActions: [
        {
          title: 'إضافة عقار جديد',
          description: 'لديك مساحة لإضافة 13 عقار إضافي في باقاتك الحالية',
          priority: 'high',
          link: '/properties/new'
        },
        {
          title: 'مراجعة الفواتير المتأخرة',
          description: 'لديك 2 فاتورة متأخرة تحتاج متابعة',
          priority: 'medium',
          link: '/invoices?status=overdue'
        },
        {
          title: 'تحديث ملف الشركة',
          description: 'أضف صور جديدة لعقاراتك لزيادة معدل المشاهدة',
          priority: 'low',
          link: '/properties/edit'
        }
      ],
      trends: [
        { metric: 'الإيرادات', value: 15420, change: 12.5, trend: 'up' },
        { metric: 'معدل الإشغال', value: 78, change: -3.2, trend: 'down' },
        { metric: 'العمليات', value: 23, change: 8.1, trend: 'up' },
        { metric: 'رضا العملاء', value: 4.7, change: 0.3, trend: 'up' }
      ]
    };

    setAiInsights(insights);
  };

  const toggleSection = (section: keyof ExpandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-OM', {
      style: 'currency',
      currency: 'OMR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البروفايل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <FiUser className="mx-auto h-12 w-12 text-gray-400 mb-4" />
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
  const canManageProperties = hasPermission(user.role, 'canEditProperty');
  const canManageUsers = hasPermission(user.role, 'canViewUsers');
  const canAccessAdmin = hasPermission(user.role, 'canAccessAdmin');

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>البروفايل - {user.name}</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-lg"
                  src={user.avatar || '/default-avatar.png'}
                  alt={user.name}
                />
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                  <FiCheckCircle className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl">{roleConfig?.icon}</span>
                  <span className="text-lg font-medium text-gray-700">{roleConfig?.name.ar}</span>
                </div>
                {user.company && (
                  <p className="text-gray-600 mt-1">{user.company}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FiMail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiPhone className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                  {user.location && (
                    <div className="flex items-center gap-1">
                      <FiMapPin className="w-4 h-4" />
                      <span>{user.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(getDashboardPath(user.role))}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FiBarChart />
                لوحة التحكم
              </button>
              <button
                onClick={() => router.push('/profile/edit')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <FiEdit />
                تعديل البروفايل
              </button>
            </div>
          </div>

          {/* Subscription Info */}
          {user.subscription && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">باقة الاشتراك</h3>
                  <p className="text-gray-600">{user.subscription.planName}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">الأيام المتبقية</div>
                  <div className="text-2xl font-bold text-blue-600">{user.subscription.remainingDays}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">تاريخ الانتهاء</div>
                  <div className="font-medium">{formatDate(user.subscription.expiryDate)}</div>
                </div>
                <button
                  onClick={() => router.push('/subscriptions')}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  ترقية
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div
                className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('quickActions')}
              >
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FiZap className="text-yellow-500" />
                  الإجراءات السريعة
                </h2>
                {expandedSections.quickActions ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              {expandedSections.quickActions && (
                <div className="p-6 pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {canManageProperties && (
                      <>
                        <button
                          onClick={() => router.push('/properties/new')}
                          className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                        >
                          <FiPlus className="w-8 h-8 text-green-600 mb-2" />
                          <span className="text-sm font-medium text-green-800">إضافة عقار</span>
                        </button>
                        <button
                          onClick={() => router.push('/properties')}
                          className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <FiHome className="w-8 h-8 text-blue-600 mb-2" />
                          <span className="text-sm font-medium text-blue-800">إدارة العقارات</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => router.push('/tasks/new')}
                      className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                      <FiPlus className="w-8 h-8 text-purple-600 mb-2" />
                      <span className="text-sm font-medium text-purple-800">إنشاء مهمة</span>
                    </button>
                    <button
                      onClick={() => router.push('/calendar')}
                      className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                    >
                      <FiCalendar className="w-8 h-8 text-orange-600 mb-2" />
                      <span className="text-sm font-medium text-orange-800">التقويم</span>
                    </button>
                    <button
                      onClick={() => router.push('/invoices')}
                      className="flex flex-col items-center p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                    >
                      <FiDollarSign className="w-8 h-8 text-emerald-600 mb-2" />
                      <span className="text-sm font-medium text-emerald-800">الفواتير</span>
                    </button>
                    <button
                      onClick={() => router.push('/legal/new')}
                      className="flex flex-col items-center p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <FiFileText className="w-8 h-8 text-red-600 mb-2" />
                      <span className="text-sm font-medium text-red-800">قضية قانونية</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* AI Insights */}
            {aiInsights && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div
                  className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection('analytics')}
                >
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <FiStar className="text-indigo-500" />
                    رؤى الذكاء الاصطناعي
                    <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm">
                      {aiInsights.performanceScore}%
                    </span>
                  </h2>
                  {expandedSections.analytics ? <FiChevronUp /> : <FiChevronDown />}
                </div>
                {expandedSections.analytics && (
                  <div className="p-6 pt-0 space-y-6">
                    
                    {/* Performance Score */}
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
                        <span className="text-2xl font-bold text-white">{aiInsights.performanceScore}%</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">نقاط الأداء</h3>
                      <p className="text-gray-600">بناءً على نشاطك وتحقيق أهدافك</p>
                    </div>

                    {/* Trends */}
                    <div className="grid grid-cols-2 gap-4">
                      {aiInsights.trends.map((trend, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">{trend.metric}</span>
                            <div className={`flex items-center gap-1 ${
                              trend.trend === 'up' ? 'text-green-600' : 
                              trend.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              <FiTrendingUp className={`w-4 h-4 ${
                                trend.trend === 'down' ? 'rotate-180' : ''
                              }`} />
                              <span className="text-sm">{trend.change > 0 ? '+' : ''}{trend.change}%</span>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {typeof trend.value === 'number' && trend.value > 1000 
                              ? trend.value.toLocaleString() 
                              : trend.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">التوصيات الذكية</h4>
                      <div className="space-y-3">
                        {aiInsights.recommendations.map((rec, index) => (
                          <div key={index} className={`p-4 rounded-lg border-l-4 ${
                            rec.type === 'success' ? 'bg-green-50 border-green-500' :
                            rec.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                            'bg-blue-50 border-blue-500'
                          }`}>
                            <div className="flex items-start justify-between">
                              <div>
                                <h5 className="font-medium text-gray-900">{rec.title}</h5>
                                <p className="text-gray-600 text-sm mt-1">{rec.description}</p>
                              </div>
                              {rec.action && (
                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                  {rec.action}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Next Actions */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">الإجراءات المقترحة</h4>
                      <div className="space-y-3">
                        {aiInsights.nextActions.map((action, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <h5 className="font-medium text-gray-900">{action.title}</h5>
                              <p className="text-gray-600 text-sm">{action.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                action.priority === 'high' ? 'bg-red-100 text-red-800' :
                                action.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {action.priority === 'high' ? 'عاجل' :
                                 action.priority === 'medium' ? 'متوسط' : 'منخفض'}
                              </span>
                              <button
                                onClick={() => router.push(action.link)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <FiExternalLink />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Properties Section */}
            {canManageProperties && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div
                  className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection('properties')}
                >
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <FiHome className="text-green-500" />
                    عقاراتي المنشورة
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                      {user.stats?.properties || 0}
                    </span>
                  </h2>
                  {expandedSections.properties ? <FiChevronUp /> : <FiChevronDown />}
                </div>
                {expandedSections.properties && (
                  <div className="p-6 pt-0">
                    <div className="text-center py-8">
                      <FiHome className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عقارات منشورة</h3>
                      <p className="text-gray-500 mb-4">ابدأ بإضافة عقارك الأول</p>
                      <button
                        onClick={() => router.push('/properties/new')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        إضافة عقار جديد
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tasks Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div
                className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('tasks')}
              >
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FiTarget className="text-purple-500" />
                  المهام
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                    {user.stats?.tasks || 0}
                  </span>
                </h2>
                {expandedSections.tasks ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              {expandedSections.tasks && (
                <div className="p-6 pt-0">
                  <div className="text-center py-8">
                    <FiTarget className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مهام</h3>
                    <p className="text-gray-500 mb-4">ابدأ بإنشاء مهمة جديدة</p>
                    <button
                      onClick={() => router.push('/tasks/new')}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                    >
                      إنشاء مهمة جديدة
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* User Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">إحصائياتي</h3>
              <div className="space-y-4">
                {user.stats && Object.entries(user.stats).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-600 capitalize">
                      {key === 'properties' ? 'العقارات' :
                       key === 'units' ? 'الوحدات' :
                       key === 'bookings' ? 'الحجوزات' :
                       key === 'revenue' ? 'الإيرادات' :
                       key === 'tasks' ? 'المهام' :
                       key === 'legalCases' ? 'القضايا القانونية' : key}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {key === 'revenue' ? formatCurrency(value) : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Role Permissions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">صلاحياتي</h3>
              <div className="space-y-2">
                {roleConfig?.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <FiCheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* System Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات النظام</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-gray-400" />
                  <span className="text-gray-600">آخر تسجيل دخول:</span>
                  <span className="font-medium">{user.lastLogin ? formatDate(user.lastLogin) : 'غير محدد'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiActivity className="text-gray-400" />
                  <span className="text-gray-600">عدد تسجيلات الدخول:</span>
                  <span className="font-medium">{user.loginCount || 0}</span>
                </div>
                {user.ipAddress && (
                  <div className="flex items-center gap-2">
                    <FiGlobe className="text-gray-400" />
                    <span className="text-gray-600">عنوان IP:</span>
                    <span className="font-medium">{user.ipAddress}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            {user.documents && user.documents.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">مستنداتي</h3>
                <div className="space-y-3">
                  {user.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">{doc.name}</span>
                      <div className="flex items-center gap-2">
                        {doc.verified ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <FiCheckCircle className="w-4 h-4" />
                            موثق
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center gap-1">
                            <FiAlertCircle className="w-4 h-4" />
                            غير موثق
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}