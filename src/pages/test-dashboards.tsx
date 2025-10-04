// src/pages/test-dashboards.tsx - صفحة اختبار لوحات التحكم
import React from 'react';
import Link from 'next/link';
import { 
  FiShield, FiBuilding, FiUser, FiArrowRight,
  FiBarChart3, FiUsers, FiCalendar, FiActivity,
  FiSettings, FiTrendingUp, FiPackage, FiDollarSign,
  FiCheckCircle, FiAlertTriangle, FiInfo
} from 'react-icons/fi';

export default function TestDashboards() {
  const dashboardTests = [
    {
      id: 'admin',
      title: 'لوحة إدارة النظام الكاملة',
      url: '/dashboard/admin',
      description: 'لوحة تحكم شاملة لإدارة الموقع بالكامل',
      icon: <FiShield size={32} />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      features: [
        'إدارة المستخدمين والأذونات',
        'مراقبة النظام والأداء',
        'إدارة جميع العقارات',
        'إدارة جميع الحجوزات',
        'التحليلات والتقارير',
        'إعدادات النظام'
      ],
      testLinks: [
        { name: 'إدارة الحجوزات', url: '/admin/bookings' },
        { name: 'إدارة المهام', url: '/admin/tasks' },
        { name: 'إدارة العقارات', url: '/manage-properties' },
        { name: 'مزامنة البيانات', url: '/admin/tasks/sync' }
      ]
    },
    {
      id: 'property-owner',
      title: 'لوحة إدارة العقار والملاك',
      url: '/dashboard/property-owner',
      description: 'لوحة تحكم للملاك وإدارة العقارات',
      icon: <FiBuilding size={32} />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      features: [
        'إدارة عقاراتك',
        'مراجعة الحجوزات',
        'إدارة العملاء',
        'التحليلات المالية',
        'إدارة المهام',
        'التقارير والإحصائيات'
      ],
      testLinks: [
        { name: 'إدارة الحجوزات', url: '/admin/bookings' },
        { name: 'إدارة العقارات', url: '/manage-properties' },
        { name: 'إضافة عقار جديد', url: '/properties/new' },
        { name: 'إدارة المهام', url: '/admin/tasks' }
      ]
    },
    {
      id: 'customer',
      title: 'لوحة العميل',
      url: '/dashboard/customer',
      description: 'لوحة تحكم للعملاء لعرض حجوزاتهم ومعاملاتهم',
      icon: <FiUser size={32} />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      features: [
        'عرض حجوزاتك',
        'إدارة المدفوعات',
        'العقارات المستأجرة',
        'التواصل مع الإدارة',
        'تتبع المعاملات',
        'الرسائل والإشعارات'
      ],
      testLinks: [
        { name: 'حجوزاتي', url: '/profile/bookings' },
        { name: 'تصفح العقارات', url: '/properties' },
        { name: 'الملف الشخصي', url: '/profile' },
        { name: 'الرسائل', url: '/messages' }
      ]
    }
  ];

  const systemFeatures = [
    {
      title: 'مزامنة فورية',
      description: 'تحديث فوري بين جميع لوحات التحكم',
      icon: <FiActivity size={24} className="text-green-600" />,
      status: 'active'
    },
    {
      title: 'ذكاء اصطناعي',
      description: 'تحليلات ذكية ونصائح مخصصة',
      icon: <FiTrendingUp size={24} className="text-purple-600" />,
      status: 'active'
    },
    {
      title: 'أمان متقدم',
      description: 'حماية شاملة للبيانات',
      icon: <FiShield size={24} className="text-red-600" />,
      status: 'active'
    },
    {
      title: 'واجهة متطورة',
      description: 'تصميم حديث وسهل الاستخدام',
      icon: <FiSettings size={24} className="text-blue-600" />,
      status: 'active'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">اختبار لوحات التحكم</h1>
              <p className="text-gray-600 mt-1">اختبار شامل لجميع لوحات التحكم والمزامنة</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                العودة للوحات التحكم
              </Link>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <FiBarChart3 size={20} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* System Status */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">حالة النظام</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {systemFeatures.map((feature, index) => (
              <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {feature.icon}
                </div>
                <div className="mr-4">
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
                <div className="flex-shrink-0">
                  <FiCheckCircle size={20} className="text-green-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Tests */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {dashboardTests.map((dashboard) => (
            <div
              key={dashboard.id}
              className={`${dashboard.bgColor} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200`}
            >
              <div className="p-8">
                {/* Icon and Title */}
                <div className="flex items-center mb-6">
                  <div className={`${dashboard.color} ml-4`}>
                    {dashboard.icon}
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${dashboard.color}`}>
                      {dashboard.title}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {dashboard.description}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">المميزات:</h3>
                  <ul className="space-y-2">
                    {dashboard.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <FiCheckCircle size={14} className="text-green-500 ml-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Test Links */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">روابط الاختبار:</h3>
                  <div className="space-y-2">
                    {dashboard.testLinks.map((link, index) => (
                      <Link
                        key={index}
                        href={link.url}
                        className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        • {link.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Main Action Button */}
                <Link
                  href={dashboard.url}
                  className={`${dashboard.color.replace('text-', 'bg-').replace('-600', '-500')} hover:opacity-90 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center group`}
                >
                  <span>اختبار اللوحة</span>
                  <FiArrowRight size={18} className="mr-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Testing Instructions */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">تعليمات الاختبار</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">اختبار المزامنة:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>افتح لوحة العميل في تبويب جديد</li>
                <li>افتح لوحة إدارة العقار في تبويب آخر</li>
                <li>أضف حجز جديد من لوحة العميل</li>
                <li>تحقق من ظهور الحجز في لوحة إدارة العقار</li>
                <li>حدث حالة الحجز من لوحة الإدارة</li>
                <li>تحقق من تحديث الحالة في لوحة العميل</li>
              </ol>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">اختبار الوظائف:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>تأكد من عمل جميع الروابط</li>
                <li>اختبر إضافة وتعديل البيانات</li>
                <li>تحقق من عرض الإحصائيات</li>
                <li>اختبر الفلاتر والبحث</li>
                <li>تحقق من الاستجابة على الأجهزة المختلفة</li>
                <li>اختبر سرعة التحميل والأداء</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">إجراءات سريعة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              href="/admin/bookings" 
              className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-center"
            >
              <FiCalendar size={24} className="text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-800">إدارة الحجوزات</span>
            </Link>
            <Link 
              href="/admin/tasks" 
              className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-center"
            >
              <FiActivity size={24} className="text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-800">إدارة المهام</span>
            </Link>
            <Link 
              href="/profile/bookings" 
              className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-center"
            >
              <FiUser size={24} className="text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-800">حجوزاتي</span>
            </Link>
            <Link 
              href="/manage-properties" 
              className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-center"
            >
              <FiBuilding size={24} className="text-orange-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-800">إدارة العقارات</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}



