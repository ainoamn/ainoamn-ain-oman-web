// src/pages/profile/index.tsx - لوحة التحكم والبروفايل المتقدمة
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import InstantLink from '@/components/InstantLink';
import { 
  FiUser, FiMail, FiPhone, FiShield, FiEdit, FiSettings,
  FiHome, FiDollarSign, FiFileText, FiCheckCircle,
  FiZap, FiStar, FiLock, FiUnlock, FiTrendingUp,
  FiGrid, FiList, FiEye, FiEyeOff, FiRefreshCw,
  FiBell, FiCalendar, FiClock, FiAlertCircle, FiCheck,
  FiPackage, FiUsers, FiBarChart2, FiActivity,
  FiChevronDown, FiChevronUp, FiArrowRight, FiTarget
} from 'react-icons/fi';
import { ALL_PERMISSIONS } from '@/lib/permissions';
import dynamic from 'next/dynamic';

// Dynamic import لـ recharts (client-side only)
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });


interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  permissions: string[];
  subscription?: { plan: string; expiresAt?: string };
  picture?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [realStats, setRealStats] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    loadUserData();

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('permissions_channel');
      channel.onmessage = (event) => {
        console.log('📡 Profile: Broadcast received');
        if (event.data.type === 'PERMISSIONS_UPDATED' || event.data.type === 'PERMISSIONS_INITIALIZED') {
          setTimeout(() => {
            setLoading(true);
            loadUserData();
            setRefreshKey(prev => prev + 1);
          }, 200);
        }
      };
    } catch (e) {}

    const handleUpdate = () => {
      setTimeout(() => {
        setLoading(true);
        loadUserData();
        setRefreshKey(prev => prev + 1);
      }, 200);
    };

    window.addEventListener('permissions:updated', handleUpdate);
    return () => {
      if (channel) channel.close();
      window.removeEventListener('permissions:updated', handleUpdate);
    };
  }, [mounted]);

  const loadUserData = async () => {
    try {
      const authData = localStorage.getItem('ain_auth');
      if (!authData) {
        router.push('/login');
        return;
      }

      const userData = JSON.parse(authData);
      let permissions = userData.permissions || [];
      
      // محاولة تحميل من API أولاً (للمتصفحات المختلفة)
      try {
        const response = await fetch('/api/roles/load');
        if (response.ok) {
          const data = await response.json();
          const userRole = data.roles.find((r: any) => r.id === userData.role);
          if (userRole) {
            permissions = userRole.permissions;
            console.log('✅ Profile: Loaded from API:', permissions.length, 'permissions');
            // حفظ في localStorage أيضاً
            localStorage.setItem('roles_permissions_config', JSON.stringify(data.roles));
          }
        }
      } catch (apiError) {
        console.log('⚠️ Profile: API failed, trying localStorage...');
        
        // fallback إلى localStorage
        const rolesConfig = localStorage.getItem('roles_permissions_config');
        if (rolesConfig) {
          const roles = JSON.parse(rolesConfig);
          const userRole = roles.find((r: any) => r.id === userData.role);
          if (userRole) {
            permissions = userRole.permissions;
            console.log('✅ Profile: Loaded from localStorage:', permissions.length, 'permissions');
          }
        }
      }

      setUser({ ...userData, permissions });
      
      // تحميل الإحصائيات الحقيقية
      loadRealStats();
      // تحميل AI Insights
      loadAIInsights();
      
      setLoading(false);
    } catch (error) {
      router.push('/login');
    }
  };

  const loadRealStats = async () => {
    try {
      const response = await fetch('/api/stats/profile');
      if (response.ok) {
        const data = await response.json();
        setRealStats(data);
        console.log('✅ Profile: Real stats loaded:', data);
      }
    } catch (error) {
      console.error('Error loading real stats:', error);
    }
  };

  const loadAIInsights = async () => {
    try {
      const response = await fetch('/api/insights/ai');
      if (response.ok) {
        const data = await response.json();
        setAiInsights(data.insights || getDefaultInsights());
        console.log('✅ Profile: AI Insights loaded:', data.insights?.length);
      } else {
        setAiInsights(getDefaultInsights());
      }
    } catch (error) {
      console.error('Error loading AI insights:', error);
      setAiInsights(getDefaultInsights());
    }
  };

  const getDefaultInsights = () => [
    {
      id: 1,
      icon: '📈',
      title: 'الأداء ممتاز',
      description: 'نشاطك زاد بنسبة 95% مقارنة بالأسبوع الماضي',
      action: null
    },
    {
      id: 2,
      icon: '📊',
      title: 'النشاط متزايد',
      description: '+12% في عدد العقارات المعروضة',
      action: null
    },
    {
      id: 3,
      icon: '🎯',
      title: 'توقعات إيجابية',
      description: 'اتجاه إيجابي في الأسابيع القادمة 🔥',
      action: null
    }
  ];

  const hasPermission = (perm: string) => {
    if (!user) return false;
    if (user.permissions.includes('*')) return true;
    return user.permissions.includes(perm);
  };

  // Quick Actions والإحصائيات (يجب أن تكون بعد التحقق من user)
  let finalQuickActions: any[] = [];
  let stats: any[] = [];

  if (user) {
    // Quick Actions حسب الصلاحيات
    const allActions = [
      { id: 'my_properties', label: 'إدارة عقاراتي', icon: FiHome, link: '/properties/unified-management', permission: 'view_properties', color: 'blue', desc: 'لوحة تحكم متقدمة' },
      { id: 'add_property', label: 'إضافة عقار', icon: FiPackage, link: '/properties/new', permission: 'add_property', color: 'green', desc: 'أضف عقار جديد' },
      { id: 'roles_permissions', label: 'إدارة الصلاحيات', icon: FiShield, link: '/admin/roles-permissions', permission: 'manage_users', color: 'red', desc: 'التحكم بصلاحيات الأدوار' },
      { id: 'financial', label: 'النظام المالي', icon: FiDollarSign, link: '/admin/financial', permission: 'view_financial', color: 'emerald', desc: 'المالية والحسابات' },
      { id: 'invoices', label: 'الفواتير', icon: FiFileText, link: '/admin/invoices', permission: 'create_invoice', color: 'indigo', desc: 'إدارة الفواتير' },
      { id: 'bookings', label: 'الحجوزات', icon: FiCalendar, link: '/bookings', permission: 'view_properties', color: 'purple', desc: 'متابعة الحجوزات' },
      { id: 'maintenance', label: 'الصيانة', icon: FiSettings, link: '/admin/maintenance', permission: 'view_maintenance', color: 'orange', desc: 'طلبات الصيانة' },
      { id: 'tasks', label: 'المهام', icon: FiCheckCircle, link: '/admin/tasks', permission: 'manage_tasks', color: 'teal', desc: 'إدارة المهام' },
      { id: 'legal', label: 'القانونية', icon: FiFileText, link: '/legal', permission: 'view_legal', color: 'red', desc: 'القضايا القانونية' },
      { id: 'users', label: 'المستخدمين', icon: FiUsers, link: '/admin/users', permission: 'manage_users', color: 'pink', desc: 'إدارة المستخدمين' },
      { id: 'all_properties', label: 'تصفح العقارات', icon: FiGrid, link: '/properties', permission: 'view_properties', color: 'cyan', desc: 'جميع العقارات' },
    ];

    // تصفية حسب الصلاحيات
    const quickActions = allActions.filter(action => hasPermission(action.permission));

    // إضافة أزرار أساسية للجميع (بدون شروط)
    const basicActions = [
      { id: 'dashboard', label: 'لوحة التحكم', icon: FiGrid, link: user.role === 'admin' ? '/admin/dashboard' : `/dashboard/${user.role === 'property_owner' ? 'owner' : user.role}`, color: 'blue', desc: 'لوحتك الرئيسية' },
      { id: 'browse', label: 'تصفح العقارات', icon: FiHome, link: '/properties', color: 'green', desc: 'جميع العقارات المتاحة' },
    ];

    // دمج الأزرار
    finalQuickActions = [...basicActions, ...quickActions];

    // إحصائيات ذكية (من البيانات الحقيقية)
    stats = [
      { 
        label: 'عقاراتي', 
        value: realStats?.stats?.properties?.total || 0, 
        icon: FiHome, 
        color: 'blue' 
      },
      { 
        label: 'المهام المعلقة', 
        value: realStats?.stats?.tasks?.pending || 0, 
        icon: FiClock, 
        color: 'yellow' 
      },
      { 
        label: 'الإشعارات الجديدة', 
        value: realStats?.stats?.notifications?.unread || 0, 
        icon: FiBell, 
        color: 'red' 
      },
      { 
        label: 'الحجوزات', 
        value: realStats?.stats?.bookings?.total || 0, 
        icon: FiCalendar, 
        color: 'green' 
      },
    ];
  }

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  const isAdmin = user.permissions.includes('*');

  return (
    <>
      <Head>
        <title>لوحة التحكم | Ain Oman</title>
      </Head>

      <div key={refreshKey} className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header الرئيسي */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 mb-6 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl font-bold shadow-xl">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                {isAdmin && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1.5 shadow-lg">
                    <FiStar className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-right">
                <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
                <p className="text-white/80 mb-3">{getRoleName(user.role)}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm">
                    {user.email}
                  </span>
                  {user.subscription && (
                    <span className="bg-yellow-400/30 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold">
                      ⭐ {getPlanName(user.subscription.plan)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                {/* زر لوحة التحكم الرئيسي */}
                <InstantLink
                  href={user.role === 'admin' ? '/admin/dashboard' : `/dashboard/${user.role === 'property_owner' ? 'owner' : user.role}`}
                  className="px-8 py-3 bg-green-500 hover:bg-green-600 rounded-xl transition font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FiGrid className="w-5 h-5 inline ml-2" />
                  لوحة التحكم
                </InstantLink>

                {/* زر التحديث */}
                <button 
                  onClick={() => {
                    setLoading(true);
                    loadUserData();
                    setRefreshKey(prev => prev + 1);
                  }}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl transition font-semibold"
                >
                  <FiRefreshCw className="w-5 h-5 inline ml-2" />
                  تحديث
                </button>
              </div>
            </div>
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* أزرار التحكم السريعة - حسب الصلاحيات */}
          {finalQuickActions.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">🎯 التحكم السريع</h2>
                  <p className="text-sm text-gray-600 mt-1">{finalQuickActions.length} ميزة متاحة</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {finalQuickActions.map((action) => (
                  <InstantLink
                    key={action.id}
                    href={action.link}
                    className={`group relative flex flex-col items-center gap-3 p-6 rounded-xl bg-gradient-to-br from-${action.color}-50 to-${action.color}-100 hover:from-${action.color}-100 hover:to-${action.color}-200 transition-all shadow-lg hover:shadow-2xl transform hover:scale-105 border-2 border-${action.color}-200 hover:border-${action.color}-300`}
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br from-${action.color}-500 to-${action.color}-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-900 mb-1">{action.label}</p>
                      <p className="text-xs text-gray-600">{action.desc}</p>
                    </div>
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiArrowRight className={`w-5 h-5 text-${action.color}-600`} />
                    </div>
                  </InstantLink>
                ))}
              </div>
            </div>
          )}

          {/* الرسوم البيانية التفاعلية */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* أداء العقارات */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FiTrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">أداء العقارات</h3>
                  <p className="text-sm text-gray-600">آخر 6 أشهر</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={realStats?.chartData?.performance || []}>
                  <defs>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="views" stroke="#3B82F6" fillOpacity={1} fill="url(#viewsGradient)" name="المشاهدات" />
                  <Area type="monotone" dataKey="bookings" stroke="#10B981" fillOpacity={1} fill="url(#bookingsGradient)" name="الحجوزات" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* الإيرادات */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <FiDollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">الإيرادات الشهرية</h3>
                  <p className="text-sm text-gray-600">مقارنة بالمصروفات</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={realStats?.chartData?.revenue || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#10B981" name="الإيرادات" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expenses" fill="#EF4444" name="المصروفات" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* الإشعارات والتنبيهات */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* التنبيهات */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <FiAlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">التنبيهات</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border-r-4 border-yellow-500">
                  <FiClock className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-gray-900">لا توجد تنبيهات عاجلة</p>
                    <p className="text-sm text-gray-600">جميع المهام محدّثة</p>
                  </div>
                </div>
              </div>
            </div>

            {/* المهام */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <FiCheck className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">المهام القادمة</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <FiCheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">لا توجد مهام معلقة</p>
                    <p className="text-sm text-gray-600">أحسنت! 🎉</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights - تحليلات ذكية */}
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-6 mb-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <FiActivity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">🤖 تحليلات ذكية</h3>
                <p className="text-white/80 text-sm">مدعوم بالذكاء الاصطناعي - {aiInsights.length} توصية</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiInsights.map((insight) => (
                <div key={insight.id} className="bg-white/10 backdrop-blur rounded-xl p-4 hover:bg-white/20 transition">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{insight.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-1">{insight.title}</h4>
                      <p className="text-sm text-white/80">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* الصلاحيات - قابلة للطي */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            {/* Header مع زر الإدارة */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowPermissions(!showPermissions)}
                className="flex-1 flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <FiShield className="w-6 h-6 text-blue-600" />
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-gray-900">صلاحياتك</h3>
                    <p className="text-sm text-gray-600">
                      {isAdmin ? 'جميع الصلاحيات (∞)' : `${user.permissions.length} صلاحية نشطة`}
                    </p>
                  </div>
                </div>
                {showPermissions ? <FiChevronUp className="w-6 h-6 text-gray-600" /> : <FiChevronDown className="w-6 h-6 text-gray-600" />}
              </button>
              
              {/* زر إدارة الصلاحيات (للمديرين فقط) */}
              {hasPermission('manage_users') && (
                <InstantLink
                  href="/admin/roles-permissions"
                  className="mr-3 px-6 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-bold hover:from-red-700 hover:to-pink-700 transform hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                >
                  <FiSettings className="w-5 h-5" />
                  إدارة الأدوار
                </InstantLink>
              )}
            </div>

            {showPermissions && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                {isAdmin ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {ALL_PERMISSIONS.map(p => (
                      <div key={p.id} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-sm">
                        <FiCheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-gray-900 font-medium">{p.name.ar}</span>
                </div>
                      ))}
              </div>
                ) : user.permissions.length === 0 ? (
                  <div className="text-center py-8">
                    <FiEyeOff className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">لا توجد صلاحيات مفعّلة</p>
                    </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {ALL_PERMISSIONS.filter(p => hasPermission(p.id)).map(p => (
                      <div key={p.id} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-sm">
                        <FiUnlock className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-900 font-medium">{p.name.ar}</span>
                    </div>
                  ))}
                      </div>
                    )}
                    </div>
                  )}
                </div>

              </div>
            </div>
    </>
  );
}

function getRoleName(role: string): string {
  const roles: Record<string, string> = {
    company_admin: 'مدير الشركة',
    property_owner: 'مالك عقار',
    property_manager: 'مدير عقار',
    accountant: 'محاسب',
    legal_advisor: 'مستشار قانوني',
    sales_agent: 'مندوب مبيعات',
    maintenance_staff: 'فني صيانة',
    tenant: 'مستأجر',
    investor: 'مستثمر',
    customer_viewer: 'عميل متصفح'
  };
  return roles[role] || role;
}

function getPlanName(plan: string): string {
  const plans: Record<string, string> = {
    free: 'مجانية',
    basic: 'أساسية',
    professional: 'احترافية',
    premium: 'مميزة',
    enterprise: 'شركات'
  };
  return plans[plan] || plan;
}
