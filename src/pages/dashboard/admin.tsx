// src/pages/dashboard/admin.tsx - لوحة تحكم إدارة الموقع الكاملة
import React, { useState, useEffect } from 'react';
import InstantLink from '@/components/InstantLink';
import UnifiedDashboard from '@/components/dashboard/UnifiedDashboard';
// تم استبدال الأيقونات برموز تعبيرية لتجنب مشاكل الاستيراد

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalBookings: 0,
    totalRevenue: 0,
    systemHealth: 'healthy',
    activeTasks: 0
  });
  const [loading, setLoading] = useState(true);

  // جلب إحصائيات النظام
  useEffect(() => {
    const fetchSystemStats = async () => {
      try {
        // جلب إحصائيات من مصادر مختلفة
        const [bookingsRes, propertiesRes, tasksRes] = await Promise.all([
          fetch('/api/bookings'),
          fetch('/api/properties'),
          fetch('/api/tasks/simple')
        ]);

        const bookings = bookingsRes.ok ? await bookingsRes.json() : { items: [] };
        const properties = propertiesRes.ok ? await propertiesRes.json() : [];
        const tasks = tasksRes.ok ? await tasksRes.json() : { items: [] };

        setSystemStats({
          totalUsers: 150, // تقديري - يمكن جلب من API منفصل
          totalProperties: Array.isArray(properties) ? properties.length : 0,
          totalBookings: Array.isArray(bookings.items) ? bookings.items.length : 0,
          totalRevenue: Array.isArray(bookings.items) ? 
            bookings.items.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0) : 0,
          systemHealth: 'healthy',
          activeTasks: Array.isArray(tasks.items) ? tasks.items.length : 0
        });
      } catch (error) {
        console.error('Error fetching system stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemStats();
  }, []);

  // إحصائيات النظام
  const adminStats = [
    { 
      id: 1, 
      title: 'إجمالي المستخدمين', 
      value: systemStats.totalUsers.toLocaleString(), 
      icon: <span className="text-2xl">👥</span>, 
      change: '+12% هذا الشهر', 
      color: 'bg-blue-500' 
    },
    { 
      id: 2, 
      title: 'إجمالي العقارات', 
      value: systemStats.totalProperties.toString(), 
      icon: <span className="text-2xl">🏢</span>, 
      change: '+5 هذا الأسبوع', 
      color: 'bg-green-500' 
    },
    { 
      id: 3, 
      title: 'إجمالي الحجوزات', 
      value: systemStats.totalBookings.toString(), 
      icon: <span className="text-2xl">📅</span>, 
      change: '+8% من الشهر الماضي', 
      color: 'bg-purple-500' 
    },
    { 
      id: 4, 
      title: 'إجمالي الإيرادات', 
      value: `${systemStats.totalRevenue.toLocaleString()} ر.ع`, 
      icon: <span className="text-2xl">💰</span>, 
      change: '+15% من الشهر الماضي', 
      color: 'bg-orange-500' 
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* الشريط الجانبي */}
      <div className={`bg-white shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b">
          {sidebarOpen && (
            <div>
              <h1 className="text-xl font-bold text-red-600">إدارة النظام</h1>
              <p className="text-sm text-gray-500">لوحة التحكم الرئيسية</p>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <span className="text-xl">⚙️</span>
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto pt-6">
          <div className={`px-4 space-y-2 ${!sidebarOpen && 'flex flex-col items-center'}`}>
            <button 
              className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                activeTab === 'overview' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              <span className="text-xl">📊</span>
              {sidebarOpen && <span className="mr-3">نظرة عامة</span>}
            </button>
            
            <button 
              className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                activeTab === 'users' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('users')}
            >
              <span className="text-xl">👥</span>
              {sidebarOpen && <span className="mr-3">إدارة المستخدمين</span>}
            </button>
            
            <button 
              className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                activeTab === 'properties' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('properties')}
            >
              <span className="text-xl">🏢</span>
              {sidebarOpen && <span className="mr-3">إدارة العقارات</span>}
            </button>
            
            <button 
              className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                activeTab === 'bookings' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('bookings')}
            >
              <span className="text-xl">📅</span>
              {sidebarOpen && <span className="mr-3">إدارة الحجوزات</span>}
            </button>
            
            <button 
              className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                activeTab === 'tasks' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('tasks')}
            >
              <span className="text-xl">⚡</span>
              {sidebarOpen && <span className="mr-3">إدارة المهام</span>}
            </button>
            
            <button 
              className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                activeTab === 'system' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('system')}
            >
              <span className="text-xl">🖥️</span>
              {sidebarOpen && <span className="mr-3">إدارة النظام</span>}
            </button>
            
            <button 
              className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                activeTab === 'analytics' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('analytics')}
            >
              <span className="text-xl">📈</span>
              {sidebarOpen && <span className="mr-3">التحليلات</span>}
            </button>
            
            <button 
              className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                activeTab === 'settings' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              <span className="text-xl">🔧</span>
              {sidebarOpen && <span className="mr-3">الإعدادات</span>}
            </button>
          </div>
        </nav>
        
        <div className="p-4 border-t">
          <button className="flex items-center w-full p-3 rounded-lg hover:bg-gray-100 transition-colors">
            <span className="text-xl">🚪</span>
            {sidebarOpen && <span className="mr-3">تسجيل الخروج</span>}
          </button>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="flex-1 overflow-y-auto">
        {/* الشريط العلوي */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {activeTab === 'overview' && 'نظرة عامة على النظام'}
            {activeTab === 'users' && 'إدارة المستخدمين'}
            {activeTab === 'properties' && 'إدارة العقارات'}
            {activeTab === 'bookings' && 'إدارة الحجوزات'}
            {activeTab === 'tasks' && 'إدارة المهام'}
            {activeTab === 'system' && 'إدارة النظام'}
            {activeTab === 'analytics' && 'التحليلات والتقارير'}
            {activeTab === 'settings' && 'إعدادات النظام'}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${systemStats.systemHealth === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">حالة النظام</span>
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <span className="text-xl">🔔</span>
            </button>
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">
              <span className="text-sm">🛡️</span>
            </div>
          </div>
        </header>

        {/* المحتوى */}
        <main className="p-6">
          {activeTab === 'overview' && (
            <UnifiedDashboard userType="admin" userId="user_123" />
          )}
          
          {activeTab === 'overview_old' && (
            <>
              {/* إحصائيات سريعة */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {adminStats.map(stat => (
                  <div key={stat.id} className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{stat.title}</p>
                      <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                      <span className="text-xs text-gray-500">{stat.change}</span>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color} text-white`}>
                      {stat.icon}
                    </div>
                  </div>
                ))}
              </div>

              {/* لوحات التحكم الفرعية */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">لوحات التحكم الفرعية</h3>
                  <div className="space-y-3">
                    <InstantLink 
                      href="/dashboard/property-owner" 
                      className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <span className="text-green-600 ml-3 text-xl">🏢</span>
                      <div>
                        <h4 className="font-medium text-green-800">لوحة إدارة العقار</h4>
                        <p className="text-sm text-green-600">للملاك وإدارة العقارات</p>
                      </div>
                    </InstantLink>
                    <InstantLink 
                      href="/dashboard/customer" 
                      className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <span className="text-blue-600 ml-3 text-xl">👤</span>
                      <div>
                        <h4 className="font-medium text-blue-800">لوحة العميل</h4>
                        <p className="text-sm text-blue-600">للعرض وإدارة الحجوزات</p>
                      </div>
                    </InstantLink>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">حالة النظام</h3>
                  <div className="space-y-3">
      <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">حالة الخادم</span>
                      <div className="flex items-center">
                        <span className="text-green-500 ml-1 text-sm">✅</span>
                        <span className="text-sm text-green-600">يعمل بشكل طبيعي</span>
                      </div>
      </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">قاعدة البيانات</span>
                      <div className="flex items-center">
                        <span className="text-green-500 ml-1 text-sm">✅</span>
                        <span className="text-sm text-green-600">متصل</span>
          </div>
        </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">المهام النشطة</span>
                      <span className="text-sm font-medium">{systemStats.activeTasks}</span>
                    </div>
        </div>
                </div>
              </div>

              {/* روابط سريعة */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">روابط سريعة</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <InstantLink 
                    href="/admin/bookings" 
                    className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
                  >
                    <span className="text-blue-600 mx-auto mb-2 text-2xl">📅</span>
                    <span className="text-sm font-medium text-blue-800">إدارة الحجوزات</span>
                  </InstantLink>
                  <InstantLink 
                    href="/admin/tasks" 
                    className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
                  >
                    <span className="text-green-600 mx-auto mb-2 text-2xl">⚡</span>
                    <span className="text-sm font-medium text-green-800">إدارة المهام</span>
                  </InstantLink>
                  <InstantLink 
                    href="/manage-properties" 
                    className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
                  >
                    <span className="text-purple-600 mx-auto mb-2 text-2xl">🏢</span>
                    <span className="text-sm font-medium text-purple-800">إدارة العقارات</span>
                  </InstantLink>
                  <InstantLink 
                    href="/admin/tasks/sync" 
                    className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-center"
                  >
                    <span className="text-orange-600 mx-auto mb-2 text-2xl">🗄️</span>
                    <span className="text-sm font-medium text-orange-800">مزامنة البيانات</span>
                  </InstantLink>
                </div>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">إدارة المستخدمين</h3>
                <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                  <span className="inline ml-1">➕</span>
                  مستخدم جديد
                </button>
              </div>
              <p className="text-gray-600">
                إدارة جميع مستخدمي النظام والأذونات
              </p>
            </div>
          )}

          {activeTab === 'properties' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">إدارة العقارات</h3>
                <InstantLink 
                  href="/manage-properties" 
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  عرض جميع العقارات
                </InstantLink>
              </div>
              <p className="text-gray-600">
                إدارة جميع العقارات في النظام
              </p>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">إدارة الحجوزات</h3>
                <InstantLink 
                  href="/admin/bookings" 
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  عرض جميع الحجوزات
                </InstantLink>
              </div>
              <p className="text-gray-600">
                مراجعة وإدارة جميع الحجوزات في النظام
              </p>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">إدارة المهام</h3>
                <InstantLink 
                  href="/admin/tasks" 
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  عرض جميع المهام
                </InstantLink>
              </div>
              <p className="text-gray-600">
                إدارة جميع المهام والمتابعة
              </p>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">إدارة النظام</h3>
                <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                  <span className="inline ml-1">🖥️</span>
                  مراقبة النظام
                </button>
              </div>
              <p className="text-gray-600">
                مراقبة أداء النظام والصيانة
              </p>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">التحليلات والتقارير</h3>
                <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                  <span className="inline ml-1">📥</span>
                  تصدير تقرير
                </button>
              </div>
              <p className="text-gray-600">
                تحليل أداء النظام والإحصائيات التفصيلية
              </p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">إعدادات النظام</h3>
                <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                  <span className="inline ml-1">🔧</span>
                  حفظ الإعدادات
                </button>
              </div>
              <p className="text-gray-600">
                إعدادات النظام العامة والتكوين
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
