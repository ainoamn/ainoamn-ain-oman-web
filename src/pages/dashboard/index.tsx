// src/pages/dashboard/index.tsx - صفحة اختيار نوع لوحة التحكم
import React, { useState, useEffect } from 'react';
import InstantLink from '@/components/InstantLink';
// Icons replaced with emoji characters to avoid import issues

// أنواع لوحات التحكم المتاحة
const dashboardTypes = [
  {
    id: 'admin',
    title: 'إدارة النظام الكاملة',
    description: 'لوحة تحكم شاملة لإدارة الموقع بالكامل',
    icon: <span className="text-4xl">🛡️</span>,
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
    link: '/dashboard/admin'
  },
  {
    id: 'property-owner',
    title: 'إدارة العقار والملاك',
    description: 'لوحة تحكم للملاك وإدارة العقارات',
    icon: <span className="text-4xl">🏢</span>,
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    features: [
      'إدارة عقاراتك',
      'مراجعة الحجوزات',
      'إدارة العملاء',
      'التحليلات المالية',
      'إدارة المهام',
      'التقارير والإحصائيات'
    ],
    link: '/dashboard/property-owner'
  },
  {
    id: 'customer',
    title: 'لوحة العميل',
    description: 'لوحة تحكم للعملاء لعرض حجوزاتهم ومعاملاتهم',
    icon: <span className="text-4xl">👤</span>,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    features: [
      'عرض حجوزاتك',
      'إدارة المدفوعات',
      'العقارات المستأجرة',
      'التواصل مع الإدارة',
      'تتبع المعاملات',
      'الرسائل والإشعارات'
    ],
    link: '/dashboard/customer'
  }
];

export default function Dashboard() {
  const [userAuth, setUserAuth] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    // جلب معلومات المستخدم من localStorage
    try {
      const authData = localStorage.getItem('ain_auth');
      if (authData) {
        const user = JSON.parse(authData);
        setUserAuth(user);
        setSubscription(user.subscription);
      }
    } catch (error) {
      console.log('No auth data found');
    }
  }, []);

  // تحديد اللوحات المتاحة حسب الاشتراك
  const getAvailableDashboards = () => {
    if (!userAuth) return dashboardTypes;
    
    const available = [];
    
    // لوحة الإدارة - للمديرين فقط
    if (userAuth.role === 'admin') {
      available.push(dashboardTypes[0]);
    }
    
    // لوحة المالك - للملاك والمطورين والشركات
    if (['owner', 'developer', 'company', 'broker'].includes(userAuth.role)) {
      available.push(dashboardTypes[1]);
    }
    
    // لوحة العميل - للجميع
    available.push(dashboardTypes[2]);
    
    return available;
  };

  const availableDashboards = getAvailableDashboards();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">لوحات التحكم</h1>
              <p className="text-gray-600 mt-1">
                {userAuth ? `مرحباً ${userAuth.name}` : 'اختر نوع لوحة التحكم المناسبة لك'}
              </p>
              {subscription && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {subscription.planName} - {subscription.remainingDays} يوم متبقي
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {availableDashboards.map((dashboard) => (
            <div
              key={dashboard.id}
              className={`${dashboard.bgColor} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200`}
            >
              <div className="p-8">
                {/* Icon */}
                <div className={`${dashboard.color} w-20 h-20 rounded-2xl flex items-center justify-center text-white mb-6`}>
                  {dashboard.icon}
                </div>

                {/* Title and Description */}
                <h2 className={`text-2xl font-bold ${dashboard.textColor} mb-3`}>
                  {dashboard.title}
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {dashboard.description}
                </p>

                {/* Features */}
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-800 mb-4">المميزات:</h3>
                  <ul className="space-y-2">
                    {dashboard.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <div className={`w-2 h-2 rounded-full ${dashboard.color.replace('bg-', 'bg-')} ml-3`}></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <InstantLink 
                  href={dashboard.link}
                  className={`${dashboard.color} hover:opacity-90 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center group`}
                >
                  <span>الانتقال إلى اللوحة</span>
                  <span className="mr-2 group-hover:translate-x-1 transition-transform">➡️</span>
                </InstantLink>
                </div>
              </div>
            ))}
          </div>

        {/* Subscription Management */}
        {userAuth && (
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">إدارة الاشتراك</h3>
              <InstantLink 
                href="/subscriptions"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                إدارة الاشتراك
              </InstantLink>
            </div>
            
            {subscription ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">الخطة الحالية</h4>
                  <p className="text-gray-600">{subscription.planName}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">الأيام المتبقية</h4>
                  <p className="text-gray-600">{subscription.remainingDays} يوم</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">الاستخدام</h4>
                  <p className="text-gray-600">
                    {subscription.usage.properties}/{subscription.limits.properties === -1 ? '∞' : subscription.limits.properties} عقارات
                  </p>
            </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">لم يتم العثور على اشتراك نشط</p>
                <InstantLink 
                  href="/subscriptions"
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  اشترك الآن
                </InstantLink>
              </div>
            )}
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">نظام متكامل لإدارة العقارات</h3>
            <p className="text-gray-600 mb-8 max-w-3xl mx-auto">
              نظام شامل ومتطور لإدارة العقارات والحجوزات مع مزامنة ذكية فورية بين جميع لوحات التحكم
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 text-2xl">🛡️</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">أمان عالي</h4>
                <p className="text-sm text-gray-600">نظام أمان متقدم لحماية البيانات</p>
          </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-2xl">📈</span>
            </div>
                <h4 className="font-semibold text-gray-900 mb-2">مزامنة فورية</h4>
                <p className="text-sm text-gray-600">تحديث فوري بين جميع اللوحات</p>
            </div>
            
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 text-2xl">🚀</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">تحليلات ذكية</h4>
                <p className="text-sm text-gray-600">تقارير وتحليلات متقدمة</p>
              </div>
            </div>
            </div>
          </div>
        </main>
    </div>
  );
}