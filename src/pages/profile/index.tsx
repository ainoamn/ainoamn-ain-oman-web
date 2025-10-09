// src/pages/profile/index.tsx - لوحة التحكم الذكية الموحدة
import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import InstantLink, { InstantButton } from '@/components/InstantLink';
import { 
  FiHome, FiCalendar, FiDollarSign, FiActivity, FiTrendingUp, FiAlertCircle, 
  FiCheckCircle, FiSettings, FiBell, FiClock, FiBarChart2,
  FiFileText, FiTool, FiAward, FiTarget, FiZap, FiShield, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import { subscriptionManager } from '@/lib/subscriptionSystem';
import FeatureGate, { useFeatureVisibility, PremiumBadge, UpgradePrompt } from '@/components/FeatureGate';
import { useSubscription } from '@/context/SubscriptionContext';

export default function UserProfileDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [myRentals, setMyRentals] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [myInvoices, setMyInvoices] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [myLegalCases, setMyLegalCases] = useState<any[]>([]);
  const [overdueItems, setOverdueItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    quickActions: true,
    notifications: true,
    tasks: false,
    legal: false,
    properties: false,
    rentals: false
  });

  // 🔐 Feature visibility hooks
  const { plan: currentPlan } = useSubscription();
  const showTasks = useFeatureVisibility('tasks');
  const showCalendar = useFeatureVisibility('calendar');
  const showLegal = useFeatureVisibility('legal');
  const showAnalytics = useFeatureVisibility('analytics');
  const showReports = useFeatureVisibility('analytics');

  useEffect(() => {
    loadAllData();
    generateAIInsights();
  }, []);

  const loadAllData = async () => {
    try {
      const authData = localStorage.getItem('ain_auth');
      if (!authData) {
        router.push('/login');
        return;
      }

      const userData = JSON.parse(authData);
        setUser(userData);
      setSubscription(userData.subscription);

      const userId = userData.id;

      // تحميل جميع البيانات بالتوازي
      const [propsRes, rentalsRes, bookingsRes, tasksRes, invoicesRes, eventsRes, legalRes] = await Promise.all([
        fetch('/api/properties'),
        fetch('/api/rentals'),
        fetch('/api/bookings'),
        fetch('/api/tasks'),
        fetch('/api/invoices'),
        fetch('/api/calendar/events'),
        fetch('/api/legal/cases', {
          headers: {
            'x-tenant-id': 'TENANT-1',
            'x-user-id': userId,
            'x-roles': 'USER'
          }
        })
      ]);

      // معالجة العقارات - فقط عقارات المستخدم
      if (propsRes.ok) {
        const allProps = await propsRes.json();
        const propsArray = Array.isArray(allProps) ? allProps : allProps.items || [];
        const userProps = propsArray.filter((p: any) => 
          p.ownerId === userId || p.createdBy === userId || p.userId === userId
        );
        setMyProperties(userProps);
      }

      // معالجة الإيجارات - فقط إيجارات المستخدم
      if (rentalsRes.ok) {
        const allRentals = await rentalsRes.json();
        const rentalsArray = Array.isArray(allRentals) ? allRentals : allRentals.items || [];
        const userRentals = rentalsArray.filter((r: any) => r.tenantId === userId);
        setMyRentals(userRentals);
      }

      // معالجة الحجوزات - فقط حجوزات المستخدم
      if (bookingsRes.ok) {
        const allBookings = await bookingsRes.json();
        const bookingsArray = Array.isArray(allBookings) ? allBookings : allBookings.items || [];
        const userBookings = bookingsArray.filter((b: any) => 
          b.customerId === userId || b.customerInfo?.phone === userData.phone
        );
        setMyBookings(userBookings);
      }

      // معالجة المهام - فقط مهام المستخدم
      if (tasksRes.ok) {
        const allTasks = await tasksRes.json();
        const tasksArray = Array.isArray(allTasks) ? allTasks : allTasks.items || [];
        const userTasks = tasksArray.filter((t: any) => 
          t.assignedTo === userId || t.createdBy === userId
        );
        setMyTasks(userTasks);
      }

      // معالجة الفواتير - فقط فواتير المستخدم
      if (invoicesRes.ok) {
        const allInvoices = await invoicesRes.json();
        const invoicesArray = Array.isArray(allInvoices) ? allInvoices : allInvoices.items || [];
        const userInvoices = invoicesArray.filter((inv: any) => 
          inv.customerId === userId || inv.tenantId === userId
        );
        setMyInvoices(userInvoices);
      }

      // معالجة القضايا القانونية - فقط قضايا المستخدم
      if (legalRes.ok) {
        const legalData = await legalRes.json();
        const casesArray = Array.isArray(legalData) ? legalData : legalData.items || [];
        const userCases = casesArray.filter((c: any) => 
          c.clientId === userId || 
          c.primaryLawyerId === userId ||
          (c.propertyReference && myProperties.some((p: any) => p.id === c.propertyReference.propertyId))
        );
        setMyLegalCases(userCases);
      }

      // معالجة الأحداث - فقط أحداث المستخدم
      if (eventsRes.ok) {
        const allEvents = await eventsRes.json();
        const eventsArray = Array.isArray(allEvents) ? allEvents : allEvents.items || [];
        const userEvents = eventsArray.filter((e: any) => 
          e.userId === userId || e.createdBy === userId
        );
        setCalendarEvents(userEvents);
      }

      // حساب المتأخرات
      calculateOverdueItems();

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverdueItems = () => {
    const now = new Date();
    const overdue: any[] = [];

    // فواتير متأخرة
    myInvoices.forEach((invoice: any) => {
      if (invoice.status === 'unpaid' && invoice.dueAt) {
        const dueDate = new Date(invoice.dueAt);
        if (dueDate < now) {
          const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          overdue.push({
            type: 'invoice',
            id: invoice.id,
            serial: invoice.serial || invoice.id,
            amount: invoice.amount,
            dueDate: invoice.dueAt,
            daysOverdue,
            description: 'فاتورة متأخرة',
            severity: daysOverdue > 30 ? 'critical' : daysOverdue > 15 ? 'high' : 'medium'
          });
        }
      }
    });

    // إيجارات متأخرة
    myRentals.forEach((rental: any) => {
      if (rental.status === 'active' && rental.nextPaymentDate) {
        const nextPayment = new Date(rental.nextPaymentDate);
        if (nextPayment < now) {
          const daysOverdue = Math.floor((now.getTime() - nextPayment.getTime()) / (1000 * 60 * 60 * 24));
          overdue.push({
            type: 'rental',
            id: rental.id,
            propertyId: rental.propertyId,
            amount: rental.amount,
            dueDate: rental.nextPaymentDate,
            daysOverdue,
            description: 'إيجار متأخر',
            severity: daysOverdue > 30 ? 'critical' : daysOverdue > 15 ? 'high' : 'medium'
          });
        }
      }
    });

    // شيكات مرتجعة (إذا كانت متوفرة في الفواتير)
    myInvoices.forEach((invoice: any) => {
      if (invoice.paymentMethod === 'check' && invoice.checkStatus === 'bounced') {
        overdue.push({
          type: 'bounced_check',
          id: invoice.id,
          serial: invoice.serial || invoice.id,
          amount: invoice.amount,
          checkNumber: invoice.checkNumber,
          description: 'شيك مرتجع',
          severity: 'critical'
        });
      }
    });

    setOverdueItems(overdue);
  };

  const generateAIInsights = () => {
    setTimeout(() => {
      setAiInsights({
        userBehavior: 'مستخدم نشط - يتصفح العقارات بانتظام',
        recommendation: 'نوصي بترقية باقتك للحصول على ميزات إضافية',
        nextAction: 'قم بإضافة عقارك الأول للاستفادة الكاملة من المنصة',
        trend: 'إيجابي',
        score: 85
      });
    }, 1000);
  };

  const stats = useMemo(() => {
    const pendingTasks = myTasks.filter(t => t.status !== 'done' && t.status !== 'canceled').length;
    const unpaidInvoices = myInvoices.filter(i => i.status === 'unpaid').length;
    const upcomingEvents = calendarEvents.filter(e => new Date(e.date) > new Date()).length;
    const openLegalCases = myLegalCases.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length;
    const totalOverdueAmount = overdueItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const criticalOverdue = overdueItems.filter(item => item.severity === 'critical').length;
    
    return {
      totalProperties: myProperties.length,
      publishedProperties: myProperties.filter(p => p.published).length,
      draftProperties: myProperties.filter(p => !p.published).length,
      totalRentals: myRentals.length,
      activeRentals: myRentals.filter(r => r.status === 'active').length,
      totalBookings: myBookings.length,
      pendingTasks,
      unpaidInvoices,
      upcomingEvents,
      totalRevenue: myInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.amount || 0), 0),
      pendingPayments: myInvoices.filter(i => i.status === 'unpaid').reduce((sum, i) => sum + (i.amount || 0), 0),
      totalLegalCases: myLegalCases.length,
      openLegalCases,
      totalOverdueItems: overdueItems.length,
      totalOverdueAmount,
      criticalOverdue
    };
  }, [myProperties, myRentals, myBookings, myTasks, myInvoices, calendarEvents, myLegalCases, overdueItems]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-OM', {
      style: 'currency',
      currency: 'OMR',
      maximumFractionDigits: 3
    }).format(amount || 0);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const checkFeatureAccess = (featureName: string, permission?: string) => {
    if (!subscription) {
      alert(`يرجى الاشتراك في باقة للوصول إلى ${featureName}`);
      router.push('/subscriptions');
      return false;
    }
    if (subscription.status !== 'active') {
      alert('اشتراكك منتهي. يرجى تجديد الاشتراك');
      router.push('/subscriptions');
      return false;
    }
    if (permission && subscription.permissions && !subscription.permissions.includes(permission)) {
      alert(`${featureName} غير متاح في باقتك. يرجى الترقية`);
      router.push('/subscriptions');
      return false;
    }
    return true;
  };

  const checkLimitAndNavigate = (current: number, limit: number, route: string, feature: string) => {
    if (!checkFeatureAccess(feature)) return;
    if (limit !== -1 && current >= limit) {
      alert(`وصلت للحد الأقصى (${limit}). يرجى ترقية الباقة`);
      router.push('/subscriptions');
      return;
    }
    router.push(route);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  if (!user) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-3xl shadow-2xl p-12 max-w-md">
          <span className="text-8xl block mb-6">🔐</span>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">مرحباً بك</h2>
          <p className="text-gray-600 mb-8">سجل دخولك للوصول إلى لوحة التحكم الذكية</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-bold text-lg shadow-lg transform hover:scale-105 transition-all"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Head>
        <title>لوحة التحكم - {user.name} - عين عُمان</title>
      </Head>

      {/* Top Header - User Info */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border-2 border-white/30">
                <span className="text-4xl">👤</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">مرحباً، {user.name}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-lg rounded-full text-sm font-medium border border-white/30">
                    {user.role === 'admin' ? '🛡️ مدير' : 
                     user.role === 'landlord' || user.role === 'owner' ? '🏢 مالك' : 
                     user.role === 'tenant' ? '🏠 مستأجر' :
                     user.role === 'developer' ? '🏗️ مطور' :
                     user.role === 'company' ? '🏛️ شركة' : '👤 مستخدم'}
                  </span>
                  {subscription && (
                    <>
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-lg rounded-full text-sm font-medium border border-white/30">
                        📦 {subscription.planName}
                      </span>
                      <span className={`px-3 py-1 backdrop-blur-lg rounded-full text-sm font-medium border ${
                        subscription.status === 'active' 
                          ? 'bg-green-500/30 border-green-300' 
                          : 'bg-red-500/30 border-red-300'
                      }`}>
                        {subscription.status === 'active' ? `✓ نشط (${subscription.remainingDays} يوم)` : '⚠️ منتهي'}
                      </span>
                    </>
                  )}
              </div>
              </div>
            </div>
            <button 
              onClick={() => router.push('/settings')}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-xl transition-all border border-white/30 font-medium"
            >
              <FiSettings className="w-5 h-5 inline-block ml-2" />
                  الإعدادات
            </button>
              </div>
            </div>
          </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Right Sidebar - Controls */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            {/* AI Insights */}
            {aiInsights && (
              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <FiZap className="w-6 h-6" />
        </div>
                  <div>
                    <h3 className="font-bold text-lg">مساعد AI</h3>
                    <p className="text-xs opacity-90">ذكاء اصطناعي</p>
                    </div>
                    </div>
                <div className="space-y-3 text-sm">
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="font-medium mb-1">📊 التحليل</div>
                    <div className="text-xs opacity-90">{aiInsights.userBehavior}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="font-medium mb-1">💡 التوصية</div>
                    <div className="text-xs opacity-90">{aiInsights.recommendation}</div>
                    </div>
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="font-medium mb-1">🎯 الإجراء التالي</div>
                    <div className="text-xs opacity-90">{aiInsights.nextAction}</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">نقاط الأداء</span>
                    <span className="text-2xl font-bold">{aiInsights.score}/100</span>
                    </div>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                    <div className="bg-white h-2 rounded-full transition-all" style={{ width: `${aiInsights.score}%` }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Info */}
            {subscription ? (
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">📦 اشتراكك</h3>
                  <FiCheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-1">الباقة</div>
                    <div className="text-xl font-bold text-gray-900">{subscription.planName}</div>
                    {subscription.price && (
                      <div className="text-sm text-gray-600 mt-1">
                        {formatCurrency(subscription.price)} / {subscription.duration === 'monthly' ? 'شهرياً' : 'سنوياً'}
                    </div>
                    )}
                  </div>

                  {subscription.status === 'active' && subscription.remainingDays <= 10 && (
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <FiAlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-yellow-900 mb-1">تنبيه!</div>
                          <div className="text-sm text-yellow-800">
                            ينتهي خلال {subscription.remainingDays} أيام
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Usage Metrics */}
                  <div className="space-y-3">
                    <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <FiBarChart2 className="w-4 h-4" />
                      الاستخدام
                    </div>
                    
                    {/* Properties */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-600">🏢 العقارات</span>
                        <span className={`font-bold ${
                          getUsagePercentage(myProperties.length, subscription.limits?.properties) > 80 
                            ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {myProperties.length} / {subscription.limits?.properties === -1 ? '∞' : subscription.limits?.properties}
                        </span>
                    </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 shadow-inner">
                        <div 
                          className={`h-2.5 rounded-full transition-all shadow-sm ${
                            getUsagePercentage(myProperties.length, subscription.limits?.properties) > 80 
                              ? 'bg-gradient-to-r from-red-500 to-red-600' 
                              : getUsagePercentage(myProperties.length, subscription.limits?.properties) > 50
                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                : 'bg-gradient-to-r from-blue-500 to-blue-600'
                          }`}
                          style={{ width: `${getUsagePercentage(myProperties.length, subscription.limits?.properties)}%` }}
                      ></div>
                    </div>
                  </div>

                    {/* Bookings */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-600">📅 الحجوزات</span>
                        <span className="font-bold text-gray-900">
                          {myBookings.length} / {subscription.limits?.bookings === -1 ? '∞' : subscription.limits?.bookings}
                        </span>
                    </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 shadow-inner">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-2.5 rounded-full transition-all shadow-sm"
                          style={{ width: `${getUsagePercentage(myBookings.length, subscription.limits?.bookings)}%` }}
                        ></div>
                    </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => router.push('/subscriptions')}
                    className="w-full mt-4 px-4 py-3.5 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-2xl transition-all font-bold transform hover:scale-105"
                  >
                    <FiTrendingUp className="inline-block w-5 h-5 ml-2" />
                    ترقية الباقة الآن
                  </button>
                  
                  <button 
                    onClick={() => router.push('/invoices')}
                    className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-medium text-sm"
                  >
                    <FiFileText className="inline-block w-4 h-4 ml-2" />
                    عرض الفواتير
                  </button>
                    </div>
                    </div>
            ) : (
              <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 text-white rounded-2xl shadow-2xl p-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/30 backdrop-blur-lg rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-white/50">
                    <FiAlertCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">ابدأ الآن!</h3>
                  <p className="text-sm opacity-95 mb-6">
                    اشترك في باقة للوصول إلى جميع الميزات المتقدمة
                  </p>
                  <button 
                    onClick={() => router.push('/subscriptions')}
                    className="w-full px-6 py-4 bg-white text-orange-600 rounded-xl hover:bg-gray-50 font-bold shadow-lg transform hover:scale-105 transition-all"
                  >
                    🎁 عرض الباقات
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Menu */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">القوائم</h3>
              <nav className="space-y-1">
                {[
                  { id: 'overview', label: 'نظرة عامة', icon: '📊', color: 'blue' },
                  { id: 'properties', label: 'العقارات', icon: '🏢', color: 'green' },
                  { id: 'rentals', label: 'الإيجارات', icon: '🏘️', color: 'purple' },
                  { id: 'bookings', label: 'الحجوزات', icon: '📅', color: 'indigo' },
                  { id: 'tasks', label: 'المهام', icon: '✅', color: 'teal' },
                  { id: 'calendar', label: 'التقويم', icon: '📆', color: 'pink' },
                  { id: 'invoices', label: 'الفواتير', icon: '💰', color: 'yellow' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full text-right px-4 py-3 rounded-xl transition-all font-medium ${
                      activeSection === item.id
                        ? `bg-${item.color}-50 text-${item.color}-700 shadow-md`
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-xl mr-3">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </nav>
                    </div>
                </div>

          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {[
                    { label: 'إجمالي العقارات', value: stats.totalProperties, icon: FiHome, color: 'blue', bg: 'bg-blue-500' },
                    { label: 'العقارات المستأجرة', value: stats.activeRentals, icon: FiCalendar, color: 'green', bg: 'bg-green-500' },
                    { label: 'المهام المعلقة', value: stats.pendingTasks, icon: FiCheckCircle, color: 'orange', bg: 'bg-orange-500' },
                    { label: 'الفواتير غير المدفوعة', value: stats.unpaidInvoices, icon: FiDollarSign, color: 'red', bg: 'bg-red-500' },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 ${stat.bg} bg-opacity-10 rounded-xl`}>
                          <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
                    </div>
                    </div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  ))}
                </div>

                {/* Quick Actions - قابل للطي */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('quickActions')}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <FiTarget className="w-7 h-7 text-blue-600" />
                      الإجراءات السريعة
                      <span className="text-sm font-normal text-gray-500">(6)</span>
                    </h3>
                    {expandedSections.quickActions ? (
                      <FiChevronUp className="w-6 h-6 text-gray-600" />
                    ) : (
                      <FiChevronDown className="w-6 h-6 text-gray-600" />
                    )}
                  </button>
                  
                  {expandedSections.quickActions && (
                    <div className="p-6 pt-0 border-t">
                      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                        {[
                          { 
                            label: 'إضافة عقار', 
                            desc: 'انشر عقارك', 
                            icon: '➕', 
                            color: 'from-blue-500 to-cyan-500',
                            action: () => checkLimitAndNavigate(myProperties.length, subscription?.limits?.properties || 0, '/properties/new', 'إضافة عقار')
                          },
                          { 
                            label: 'تصفح العقارات', 
                            desc: 'ابحث', 
                            icon: '🔍', 
                            color: 'from-green-500 to-emerald-500',
                            action: () => router.push('/properties')
                          },
                          { 
                            label: 'إنشاء مهمة', 
                            desc: 'مهمة جديدة', 
                            icon: '✅', 
                            color: 'from-purple-500 to-pink-500',
                            action: () => router.push('/tasks/new')
                          },
                          { 
                            label: 'المهام', 
                            desc: 'تابع مهامك', 
                            icon: '📋', 
                            color: 'from-orange-500 to-red-500',
                            action: () => router.push('/tasks')
                          },
                          { 
                            label: 'التقويم', 
                            desc: 'المواعيد', 
                            icon: '📆', 
                            color: 'from-indigo-500 to-purple-500',
                            action: () => router.push('/calendar')
                          },
                          { 
                            label: 'الفواتير', 
                            desc: 'المدفوعات', 
                            icon: '💰', 
                            color: 'from-yellow-500 to-orange-500',
                            action: () => router.push('/invoices')
                          },
                        ].map((action, idx) => (
                          <button
                            key={idx}
                            onClick={action.action}
                            className={`group relative overflow-hidden bg-gradient-to-br ${action.color} text-white p-4 rounded-xl transition-all transform hover:scale-105 shadow-md hover:shadow-lg`}
                          >
                            <div className="relative z-10 text-center">
                              <div className="text-3xl mb-2">{action.icon}</div>
                              <div className="font-bold text-sm mb-1">{action.label}</div>
                              <div className="text-xs opacity-80">{action.desc}</div>
                            </div>
                            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform"></div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* التنبيهات والإشعارات - قابل للطي */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('notifications')}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <FiBell className="w-7 h-7 text-purple-600" />
                    التنبيهات والإشعارات
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                      {stats.pendingTasks + stats.upcomingEvents + stats.unpaidInvoices}
                    </span>
                  </h3>
                  {expandedSections.notifications ? (
                    <FiChevronUp className="w-6 h-6 text-gray-600" />
                  ) : (
                    <FiChevronDown className="w-6 h-6 text-gray-600" />
                  )}
                </button>

                {expandedSections.notifications && (
                  <div className="p-6 pt-0 border-t space-y-3">
                    {stats.unpaidInvoices > 0 && (
                      <div className="bg-red-50 border-r-4 border-red-500 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <FiDollarSign className="w-6 h-6 text-red-600" />
                  </div>
                          <div>
                            <div className="font-bold text-red-900">فواتير غير مدفوعة</div>
                            <div className="text-sm text-red-700">لديك {stats.unpaidInvoices} فاتورة متأخرة</div>
                </div>
              </div>
                        <button
                          onClick={() => router.push('/invoices')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                        >
                          عرض
                        </button>
                      </div>
                    )}

                    {stats.pendingTasks > 0 && (
                      <div className="bg-orange-50 border-r-4 border-orange-500 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <FiTool className="w-6 h-6 text-orange-600" />
                          </div>
                          <div>
                            <div className="font-bold text-orange-900">مهام معلقة</div>
                            <div className="text-sm text-orange-700">لديك {stats.pendingTasks} مهمة تحتاج إلى متابعة</div>
                          </div>
                        </div>
                        <button
                          onClick={() => router.push('/tasks')}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium"
                        >
                          عرض
                        </button>
                </div>
                    )}

                    {stats.upcomingEvents > 0 && (
                      <div className="bg-blue-50 border-r-4 border-blue-500 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <FiCalendar className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-bold text-blue-900">مواعيد قادمة</div>
                            <div className="text-sm text-blue-700">لديك {stats.upcomingEvents} موعد في الأيام القادمة</div>
                          </div>
                        </div>
                        <button
                          onClick={() => router.push('/calendar')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                        >
                          عرض
                        </button>
                      </div>
                    )}

                    {myBookings.filter(b => b.status === 'pending').length > 0 && (
                      <div className="bg-green-50 border-r-4 border-green-500 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <FiCheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <div className="font-bold text-green-900">حجوزات في الانتظار</div>
                            <div className="text-sm text-green-700">
                              لديك {myBookings.filter(b => b.status === 'pending').length} حجز في انتظار التأكيد
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => router.push('/bookings')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                        >
                          عرض
                        </button>
                      </div>
                    )}

                    {(stats.unpaidInvoices === 0 && stats.pendingTasks === 0 && stats.upcomingEvents === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        <FiCheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
                        <p className="font-medium">لا توجد تنبيهات جديدة</p>
                        <p className="text-sm mt-1">أنت على اطلاع بكل شيء! 🎉</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* المهام - قابل للطي - مع FeatureGate 🔐 */}
              <FeatureGate feature="tasks" mode="lock" showUpgrade={true}>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('tasks')}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <FiTool className="w-7 h-7 text-orange-600" />
                      مهامي
                      <span className="text-sm font-normal text-gray-500">({myTasks.length})</span>
                      {!showTasks && <PremiumBadge className="mr-2" />}
                    </h3>
                    {expandedSections.tasks ? (
                      <FiChevronUp className="w-6 h-6 text-gray-600" />
                    ) : (
                      <FiChevronDown className="w-6 h-6 text-gray-600" />
                    )}
                  </button>

                {expandedSections.tasks && (
                  <div className="p-6 pt-0 border-t">
                    {myTasks.length > 0 ? (
                <div className="space-y-3">
                        {myTasks.slice(0, 5).map((task: any, idx: number) => (
                          <div 
                            key={idx}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => router.push(`/admin/tasks/${task.id}`)}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`w-3 h-3 rounded-full ${
                                task.status === 'done' ? 'bg-green-500' :
                                task.status === 'in_progress' ? 'bg-blue-500' :
                                'bg-gray-400'
                              }`}></div>
                        <div className="flex-1">
                                <div className="font-medium text-gray-900">{task.title}</div>
                                <div className="text-sm text-gray-600 flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-xs ${
                                    task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                    task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {task.priority === 'urgent' ? '🔥 عاجل' : 
                                     task.priority === 'high' ? '⚠️ عالي' : '• عادي'}
                                  </span>
                                  {task.category && <span>• {task.category}</span>}
                        </div>
                      </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/admin/tasks/${task.id}`);
                              }}
                              className="px-4 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                            >
                              فتح
                            </button>
                    </div>
                  ))}
                        {myTasks.length > 5 && (
                          <button
                            onClick={() => router.push('/tasks')}
                            className="w-full px-4 py-3 text-center text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                          >
                            عرض جميع المهام ({myTasks.length})
                          </button>
                        )}
                </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FiTool className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <p>لا توجد مهام حالياً</p>
                        <button
                          onClick={() => router.push('/tasks/new')}
                          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          إنشاء مهمة جديدة
                        </button>
              </div>
                    )}
                  </div>
                )}
                </div>
              </FeatureGate>

              {/* تنبيهات حرجة - المتأخرات */}
              {stats.totalOverdueItems > 0 && (
                <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl shadow-2xl p-8 border-l-8 border-red-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <FiAlertCircle className="w-10 h-10 animate-pulse" />
                        <h3 className="text-3xl font-bold">⚠️ تنبيه: لديك متأخرات!</h3>
                    </div>
                      <p className="text-lg opacity-95 mb-6">
                        لديك {stats.totalOverdueItems} متأخر - المبلغ الإجمالي: {formatCurrency(stats.totalOverdueAmount)}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4">
                          <div className="text-3xl font-bold mb-1">{overdueItems.filter(i => i.type === 'invoice').length}</div>
                          <div className="text-sm opacity-90">فواتير متأخرة</div>
                    </div>
                        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4">
                          <div className="text-3xl font-bold mb-1">{overdueItems.filter(i => i.type === 'rental').length}</div>
                          <div className="text-sm opacity-90">إيجارات متأخرة</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4">
                          <div className="text-3xl font-bold mb-1">{overdueItems.filter(i => i.type === 'bounced_check').length}</div>
                          <div className="text-sm opacity-90">شيكات مرتجعة</div>
                  </div>
                </div>

                      {/* قائمة المتأخرات الحرجة */}
                      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-4">
                        <h4 className="font-bold text-lg mb-3">المتأخرات الحرجة:</h4>
                        <div className="space-y-2">
                          {overdueItems.filter(i => i.severity === 'critical').slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                              <div>
                                <div className="font-bold">{item.description}</div>
                                <div className="text-sm opacity-90">
                                  {item.type === 'bounced_check' ? `شيك رقم: ${item.checkNumber}` : `رقم: ${item.serial || item.id}`}
                                  {item.daysOverdue && ` - متأخر ${item.daysOverdue} يوم`}
                    </div>
                    </div>
                              <div className="text-2xl font-bold">{formatCurrency(item.amount)}</div>
                  </div>
                          ))}
                </div>
                    </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => router.push('/invoices')}
                      className="px-6 py-3 bg-white text-red-600 rounded-xl hover:bg-gray-100 font-bold shadow-lg transition-all"
                    >
                      💰 عرض الفواتير
                    </button>
                    <button
                      onClick={() => router.push('/legal/new')}
                      className="px-6 py-3 bg-red-700 text-white rounded-xl hover:bg-red-800 font-bold shadow-lg transition-all"
                    >
                      ⚖️ اتخاذ إجراء قانوني
                    </button>
                </div>
                </div>
              )}

              {/* القضايا القانونية - قابل للطي - مع FeatureGate 🔐 */}
              {stats.totalLegalCases > 0 && (
                <FeatureGate feature="legal" mode="lock" showUpgrade={true}>
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection('legal')}
                      className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <span className="text-3xl">⚖️</span>
                        القضايا القانونية
                        <span className="text-sm font-normal text-gray-500">({stats.totalLegalCases})</span>
                        {!showLegal && <PremiumBadge className="mr-2" />}
                      </h3>
                      {expandedSections.legal ? (
                        <FiChevronUp className="w-6 h-6 text-gray-600" />
                      ) : (
                        <FiChevronDown className="w-6 h-6 text-gray-600" />
                      )}
                    </button>

                  {expandedSections.legal && (
                    <div className="p-6 pt-0 border-t">
                      <div className="flex items-center justify-end mb-4">
                        <button
                          onClick={() => router.push('/legal')}
                          className="text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2"
                        >
                          عرض الكل
                          <span className="text-xl">→</span>
                        </button>
                    </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-l-4 border-blue-500">
                      <div className="text-3xl font-bold text-blue-600 mb-1">{stats.totalLegalCases}</div>
                      <div className="text-sm text-gray-700">إجمالي القضايا</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-l-4 border-yellow-500">
                      <div className="text-3xl font-bold text-yellow-600 mb-1">{stats.openLegalCases}</div>
                      <div className="text-sm text-gray-700">قضايا مفتوحة</div>
                  </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-l-4 border-green-500">
                      <div className="text-3xl font-bold text-green-600 mb-1">{stats.totalLegalCases - stats.openLegalCases}</div>
                      <div className="text-sm text-gray-700">قضايا مغلقة</div>
                </div>
              </div>

                  {myLegalCases.length > 0 ? (
                  <div className="space-y-3">
                      {myLegalCases.slice(0, 3).map((legalCase: any, idx: number) => (
                        <div 
                          key={idx}
                          className="group border-2 border-gray-200 rounded-xl p-5 hover:shadow-xl hover:border-purple-400 transition-all cursor-pointer bg-gradient-to-br from-white to-gray-50"
                          onClick={() => router.push(`/legal/${legalCase.id}`)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-bold text-gray-900 text-lg group-hover:text-purple-600 transition-colors">
                              {legalCase.title}
                            </h4>
                            <div className="flex gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                legalCase.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                                legalCase.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                legalCase.status === 'CLOSED' ? 'bg-gray-100 text-gray-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {legalCase.status === 'OPEN' ? 'مفتوحة' :
                                 legalCase.status === 'IN_PROGRESS' ? 'قيد العمل' :
                                 legalCase.status === 'CLOSED' ? 'مغلقة' : legalCase.status}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                legalCase.priority === 'URGENT' || legalCase.priority === 'CRITICAL' 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {legalCase.priority === 'URGENT' ? '🔥 عاجلة' : 
                                 legalCase.priority === 'CRITICAL' ? '⚠️ حرجة' : 
                                 legalCase.priority}
                              </span>
                      </div>
                      </div>
                          <p className="text-sm text-gray-600 mb-3">
                            النوع: {legalCase.type === 'RENTAL_DISPUTE' ? 'نزاع إيجار' : 
                                   legalCase.type === 'PAYMENT_DISPUTE' ? 'نزاع دفع' : 
                                   legalCase.type === 'EVICTION' ? 'إخلاء' : legalCase.type}
                          </p>
                          {legalCase.propertyReference && (
                            <p className="text-xs text-gray-500 mb-2">
                              📍 العقار: {legalCase.propertyReference.propertyTitle || legalCase.propertyReference.propertyId}
                            </p>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/legal/${legalCase.id}`);
                            }}
                            className="w-full px-3 py-2 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors font-medium"
                          >
                            🔍 عرض التفاصيل
                          </button>
                      </div>
                      ))}
                  </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-6xl mb-4">⚖️</div>
                      <p>لا توجد قضايا قانونية حالياً</p>
                </div>
                  )}

                      <div className="mt-6 pt-6 border-t">
                        <button
                          onClick={() => router.push('/legal/new')}
                          className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-2xl font-bold text-lg transform hover:scale-105 transition-all"
                        >
                          ➕ إضافة قضية قانونية جديدة
                        </button>
                      </div>
                    </div>
                  )}
                  </div>
                </FeatureGate>
              )}

                {/* My Published Properties - قابل للطي */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('properties')}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <FiHome className="w-7 h-7 text-blue-600" />
                      عقاراتي المنشورة
                      <span className="text-sm font-normal text-gray-500">({myProperties.length})</span>
                    </h3>
                    {expandedSections.properties ? (
                      <FiChevronUp className="w-6 h-6 text-gray-600" />
                    ) : (
                      <FiChevronDown className="w-6 h-6 text-gray-600" />
                    )}
                  </button>

                  {expandedSections.properties && (
                    <div className="p-6 pt-0 border-t">
                      {myProperties.length > 0 && (
                        <div className="flex justify-end mb-4">
                          <button
                            onClick={() => router.push('/properties/unified-management')}
                            className="text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2"
                          >
                            عرض الكل
                            <span className="text-xl">→</span>
                          </button>
                        </div>
                      )}

                  {myProperties.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {myProperties.slice(0, 4).map((property) => (
                        <div 
                          key={property.id} 
                          className="group border-2 border-gray-200 rounded-xl p-5 hover:shadow-xl hover:border-blue-400 transition-all cursor-pointer bg-gradient-to-br from-white to-gray-50"
                          onClick={() => router.push(`/properties/${property.id}`)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                              {typeof property.title === 'string' ? property.title : property.title?.ar || property.id}
                            </h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              property.published 
                                ? 'bg-green-100 text-green-700 border border-green-300' 
                                : 'bg-gray-100 text-gray-700 border border-gray-300'
                            }`}>
                              {property.published ? '✓ منشور' : '📝 مسودة'}
                            </span>
                      </div>
                          <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                            <span>📍</span>
                            {property.governorate} - {property.state}
                          </p>
                          {property.price && (
                            <p className="text-lg font-bold text-blue-600 mb-3">
                              {formatCurrency(property.price)}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/properties/${property.id}/edit`);
                              }}
                              className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                            >
                              ✏️ تعديل
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/property/${property.id}/admin`);
                              }}
                              className="flex-1 px-3 py-2 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors font-medium"
                            >
                              ⚙️ إدارة
                            </button>
                  </div>
                </div>
                      ))}
              </div>
                  ) : (
                    <div className="text-center py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl border-2 border-dashed border-blue-300">
                      <span className="text-9xl block mb-6 animate-bounce">🏠</span>
                      <h4 className="font-bold text-gray-900 text-2xl mb-3">ابدأ رحلتك العقارية</h4>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        لا توجد عقارات منشورة بعد. انشر عقارك الأول واستفد من جميع ميزات المنصة
                      </p>
                      <button
                        onClick={() => checkLimitAndNavigate(
                          myProperties.length,
                          subscription?.limits?.properties || 0,
                          '/properties/new',
                          'إضافة عقار'
                        )}
                        className="px-10 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-2xl font-bold text-lg transform hover:scale-110 transition-all"
                      >
                        ➕ إضافة عقار جديد
                      </button>
                    </div>
                  )}
                    </div>
                  )}
                </div>

                {/* My Rented Properties - قابل للطي */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('rentals')}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <FiCalendar className="w-7 h-7 text-green-600" />
                      العقارات المستأجرة
                      <span className="text-sm font-normal text-gray-500">({myRentals.length})</span>
                    </h3>
                    {expandedSections.rentals ? (
                      <FiChevronUp className="w-6 h-6 text-gray-600" />
                    ) : (
                      <FiChevronDown className="w-6 h-6 text-gray-600" />
                    )}
                  </button>

                  {expandedSections.rentals && (
                    <div className="p-6 pt-0 border-t">

                  {myRentals.length > 0 ? (
                <div className="space-y-4">
                      {myRentals.slice(0, 3).map((rental) => (
                        <div key={rental.id} className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-xl hover:border-green-400 transition-all bg-gradient-to-r from-white to-green-50">
                          <div className="flex items-start justify-between">
                      <div className="flex-1">
                              <h4 className="font-bold text-gray-900 text-lg mb-3">
                                {rental.propertyTitle || 'عقار مستأجر'}
                              </h4>
                              <div className="space-y-2">
                                <p className="text-sm text-gray-700 flex items-center gap-2">
                                  <span className="text-lg">💰</span>
                                  <span>الإيجار: <span className="font-bold text-green-600">{formatCurrency(rental.rent)}</span> / شهر</span>
                                </p>
                                <p className="text-sm text-gray-700 flex items-center gap-2">
                                  <span className="text-lg">📅</span>
                                  <span>ينتهي في: <span className="font-semibold">{new Date(rental.endDate).toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn' })}</span></span>
                                </p>
                      </div>
                      </div>
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                              rental.status === 'active' ? 'bg-green-500 text-white' : 
                              rental.status === 'pending' ? 'bg-yellow-500 text-white' :
                              'bg-gray-300 text-gray-700'
                            }`}>
                              {rental.status === 'active' ? '✓ نشط' : 
                               rental.status === 'pending' ? '⏳ معلق' : rental.status}
                            </span>
                      </div>
                    </div>
                  ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 rounded-2xl border-2 border-dashed border-green-300">
                      <span className="text-9xl block mb-6 animate-pulse">🔑</span>
                      <h4 className="font-bold text-gray-900 text-2xl mb-3">ابحث عن منزل أحلامك</h4>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        تصفح آلاف العقارات المتاحة للإيجار واختر الأنسب لك
                      </p>
                      <button
                        onClick={() => router.push('/properties?type=rent')}
                        className="px-10 py-4 bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 text-white rounded-xl hover:shadow-2xl font-bold text-lg transform hover:scale-110 transition-all"
                      >
                        🔍 تصفح العقارات المتاحة
                      </button>
                      </div>
                    )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Upgrade Prompt - رسالة الترقية */}
            {(!showTasks || !showLegal || !showAnalytics) && (
              <UpgradePrompt />
            )}

            {/* Other sections content would go here based on activeSection */}
            {activeSection !== 'overview' && (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center py-16">
                <span className="text-8xl block mb-6">🚧</span>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">قسم {activeSection}</h3>
                <p className="text-gray-600">هذا القسم قيد التطوير وسيتم إضافته قريباً</p>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
  );
}
