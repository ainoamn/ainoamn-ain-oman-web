// src/pages/dashboard/property-owner.tsx - لوحة تحكم إدارة العقار والملاك
import React, { useState, useEffect } from 'react';
import InstantLink from '@/components/InstantLink';
import UnifiedDashboard from '@/components/dashboard/UnifiedDashboard';
import { subscriptionManager } from '@/lib/subscriptionSystem';
// تم استبدال الأيقونات برموز تعبيرية لتجنب مشاكل الاستيراد

export default function PropertyOwnerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // جلب البيانات
  useEffect(() => {
    const fetchData = async () => {
      try {
        // جلب الحجوزات
        const bookingsResponse = await fetch('/api/bookings');
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          setBookings(Array.isArray(bookingsData.items) ? bookingsData.items : []);
        }

        // جلب العقارات
        const propertiesResponse = await fetch('/api/properties');
        if (propertiesResponse.ok) {
          const propertiesData = await propertiesResponse.json();
          setProperties(Array.isArray(propertiesData) ? propertiesData : []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // إحصائيات إدارة العقار
  const propertyStats = [
    { 
      id: 1, 
      title: 'إجمالي العقارات', 
      value: properties.length.toString(), 
      icon: <span className="text-2xl">🏢</span>, 
      change: '+2 هذا الشهر', 
      color: 'bg-blue-500' 
    },
    { 
      id: 2, 
      title: 'الحجوزات النشطة', 
      value: bookings.filter((b: any) => b.status === 'reserved' || b.status === 'leased').length.toString(), 
      icon: <span className="text-2xl">📅</span>, 
      change: 'تحتاج متابعة', 
      color: 'bg-green-500' 
    },
    { 
      id: 3, 
      title: 'إجمالي الإيرادات', 
      value: `${bookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0).toLocaleString()} ر.ع`, 
      icon: <span className="text-2xl">💰</span>, 
      change: '+15% من الشهر الماضي', 
      color: 'bg-purple-500' 
    },
    { 
      id: 4, 
      title: 'العملاء النشطين', 
      value: [...new Set(bookings.map((b: any) => b.customerInfo?.name).filter(Boolean))].length.toString(), 
      icon: <span className="text-2xl">👥</span>, 
      change: 'عملاء جدد', 
      color: 'bg-orange-500' 
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reserved': return 'bg-blue-100 text-blue-800';
      case 'leased': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'accounting': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد المراجعة';
      case 'reserved': return 'محجوز';
      case 'leased': return 'مؤجّر';
      case 'cancelled': return 'ملغى';
      case 'accounting': return 'محاسبي';
      default: return status;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* الشريط الجانبي */}
      <div className={`bg-white shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b">
          {sidebarOpen && (
            <div>
              <h1 className="text-xl font-bold text-green-600">إدارة العقار</h1>
              <p className="text-sm text-gray-500">لوحة الملاك</p>
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
                activeTab === 'overview' ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              <span className="text-xl">📊</span>
              {sidebarOpen && <span className="mr-3">نظرة عامة</span>}
            </button>
            
            <button 
              className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                activeTab === 'properties' ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('properties')}
            >
              <span className="text-xl">🏢</span>
              {sidebarOpen && <span className="mr-3">العقارات</span>}
            </button>
            
            <button 
              className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                activeTab === 'bookings' ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('bookings')}
            >
              <span className="text-xl">📅</span>
              {sidebarOpen && <span className="mr-3">الحجوزات</span>}
            </button>
            
            <button 
              className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                activeTab === 'customers' ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('customers')}
            >
              <span className="text-xl">👥</span>
              {sidebarOpen && <span className="mr-3">العملاء</span>}
            </button>
            
            <button 
              className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                activeTab === 'analytics' ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('analytics')}
            >
              <span className="text-xl">📈</span>
              {sidebarOpen && <span className="mr-3">التحليلات</span>}
            </button>
            
            <button 
              className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                activeTab === 'tasks' ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('tasks')}
            >
              <span className="text-xl">⚡</span>
              {sidebarOpen && <span className="mr-3">المهام</span>}
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
            {activeTab === 'overview' && 'نظرة عامة'}
            {activeTab === 'properties' && 'إدارة العقارات'}
            {activeTab === 'bookings' && 'إدارة الحجوزات'}
            {activeTab === 'customers' && 'إدارة العملاء'}
            {activeTab === 'analytics' && 'التحليلات والتقارير'}
            {activeTab === 'tasks' && 'إدارة المهام'}
          </h2>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <span className="text-xl">🔔</span>
            </button>
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
              <span className="text-sm">👤</span>
            </div>
          </div>
        </header>

        {/* المحتوى */}
        <main className="p-6">
          {activeTab === 'overview' && (
            <UnifiedDashboard userType="property-owner" userId="user_123" />
          )}
          
          {activeTab === 'overview_old' && (
            <>
              {/* إحصائيات سريعة */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {propertyStats.map(stat => (
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

              {/* الحجوزات الحديثة */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">الحجوزات الحديثة</h3>
                  <InstantLink href="/admin/bookings" className="text-green-600 text-sm hover:underline">
                    عرض الكل
                  </InstantLink>
                </div>
                
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-right text-sm text-gray-500 border-b">
                          <th className="pb-3 px-4">الحالة</th>
                          <th className="pb-3 px-4">العميل</th>
                          <th className="pb-3 px-4">العقار</th>
                          <th className="pb-3 px-4">المبلغ</th>
                          <th className="pb-3 px-4">التاريخ</th>
                          <th className="pb-3 px-4">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.slice(0, 5).map((booking: any) => (
                          <tr key={booking.id} className="text-sm border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                                {getStatusLabel(booking.status)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {booking.customerInfo?.name || 'غير محدد'}
                            </td>
                            <td className="py-3 px-4">
                              {booking.propertyTitle || 'غير محدد'}
                            </td>
                            <td className="py-3 px-4 font-medium">
                              {booking.totalAmount?.toLocaleString()} ر.ع
                            </td>
                            <td className="py-3 px-4 text-gray-500">
                              {formatDate(booking.createdAt)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <InstantLink 
                                  href={`/admin/bookings/${booking.id}`}
                                  className="text-green-600 hover:underline text-xs"
                                >
                                  <span className="text-sm">👁️</span>
                                </InstantLink>
                                <InstantLink 
                                  href={`/admin/customers/${encodeURIComponent(booking.customerInfo?.name || '')}`}
                                  className="text-blue-600 hover:underline text-xs"
                                >
                                  <span className="text-sm">👤</span>
                                </InstantLink>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {bookings.length === 0 && (
                          <tr>
                            <td className="py-8 text-center text-gray-500" colSpan={6}>
                              لا توجد حجوزات بعد
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* العقارات النشطة */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">العقارات النشطة</h3>
                  <InstantLink href="/manage-properties" className="text-green-600 text-sm hover:underline">
                    إدارة العقارات
                  </InstantLink>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {properties.slice(0, 6).map((property: any) => (
                    <div key={property.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{property.title || 'عقار'}</h4>
                        <span className="text-xs text-gray-500">{property.reference}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{property.location}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600">
                          {property.priceOMR?.toLocaleString()} ر.ع
                        </span>
                        <InstantLink 
                          href={`/properties/${property.id}`}
                          className="text-green-600 hover:underline text-xs"
                        >
                          عرض التفاصيل
                        </InstantLink>
                      </div>
                    </div>
                  ))}
                  {properties.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-8">
                      لا توجد عقارات بعد
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'properties' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">إدارة العقارات</h3>
                <InstantLink 
                  href="/properties/new" 
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <span className="inline ml-1">➕</span>
                  إضافة عقار جديد
                </InstantLink>
              </div>
              <p className="text-gray-600 mb-4">
                إدارة جميع عقاراتك وإضافة عقارات جديدة
              </p>
              <InstantLink 
                href="/manage-properties" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                عرض جميع العقارات
              </InstantLink>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">إدارة الحجوزات</h3>
                <InstantLink 
                  href="/admin/bookings" 
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  عرض جميع الحجوزات
                </InstantLink>
              </div>
              <p className="text-gray-600 mb-4">
                مراجعة وإدارة جميع طلبات الحجز من العملاء
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800">قيد المراجعة</h4>
                  <p className="text-2xl font-bold text-yellow-600">
                    {bookings.filter((b: any) => b.status === 'pending').length}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800">محجوزة</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {bookings.filter((b: any) => b.status === 'reserved').length}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800">مؤجرة</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {bookings.filter((b: any) => b.status === 'leased').length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">إدارة العملاء</h3>
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                  <span className="inline ml-1">➕</span>
                  عميل جديد
                </button>
              </div>
              <p className="text-gray-600">
                إدارة بيانات العملاء وتتبع معاملاتهم
              </p>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">التحليلات والتقارير</h3>
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                  <span className="inline ml-1">📥</span>
                  تصدير تقرير
                </button>
              </div>
              <p className="text-gray-600">
                تحليل الأداء والإيرادات والإحصائيات التفصيلية
              </p>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">إدارة المهام</h3>
                <InstantLink 
                  href="/admin/tasks" 
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  عرض جميع المهام
                </InstantLink>
              </div>
              <p className="text-gray-600">
                إدارة المهام والمتابعة اليومية
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}



