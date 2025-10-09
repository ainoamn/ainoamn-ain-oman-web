// src/pages/dashboard/customer.tsx - لوحة تحكم العميل
import React, { useState, useEffect } from 'react';
import InstantLink from '@/components/InstantLink';
import UnifiedDashboard from '@/components/dashboard/UnifiedDashboard';
import SmartSyncIndicator from '@/components/booking/SmartSyncIndicator';
import { bookingSyncEngine, Booking } from '@/lib/bookingSyncEngine';

export default function CustomerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // جلب حجوزات العميل
  useEffect(() => {
    const fetchCustomerBookings = async () => {
      try {
        const response = await fetch('/api/bookings');
        if (response.ok) {
          const data = await response.json();
          setBookings(Array.isArray(data.items) ? data.items : []);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerBookings();
  }, []);

  // مراقبة أحداث المزامنة
  useEffect(() => {
    const handleSyncEvent = () => {
      // إعادة جلب البيانات عند المزامنة
      window.location.reload();
    };

    bookingSyncEngine.on('sync_event', handleSyncEvent);
    return () => bookingSyncEngine.off('sync_event', handleSyncEvent);
  }, []);

  // إحصائيات العميل
  const customerStats = [
    { 
      id: 1, 
      title: 'إجمالي الحجوزات',
      value: bookings.length.toString(), 
      icon: <span className="text-2xl">📅</span>, 
      change: '+2 هذا الشهر', 
      color: 'bg-blue-500' 
    },
    { 
      id: 2, 
      title: 'إجمالي المدفوعات', 
      value: `${bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0).toLocaleString()} ر.ع`, 
      icon: <span className="text-2xl">💰</span>, 
      change: 'آخر دفع: اليوم', 
      color: 'bg-green-500' 
    },
    { 
      id: 3, 
      title: 'العقارات المستأجرة', 
      value: bookings.filter(b => b.status === 'leased').length.toString(), 
      icon: <span className="text-2xl">🏠</span>, 
      change: 'نشطة حالياً', 
      color: 'bg-purple-500' 
    },
    { 
      id: 4, 
      title: 'طلبات معلقة', 
      value: bookings.filter(b => b.status === 'pending').length.toString(), 
      icon: <span className="text-2xl">🔔</span>, 
      change: 'تحتاج متابعة', 
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
              <h1 className="text-xl font-bold text-blue-600">لوحة العميل</h1>
              <p className="text-sm text-gray-500">إدارة حجوزاتك</p>
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
                activeTab === 'overview' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              <span className="text-xl">🏠</span>
              {sidebarOpen && <span className="mr-3">نظرة عامة</span>}
            </button>
            
            <button 
              className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                activeTab === 'bookings' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('bookings')}
            >
              <span className="text-xl">📅</span>
              {sidebarOpen && <span className="mr-3">حجوزاتي</span>}
            </button>
            
            <button 
              className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                activeTab === 'properties' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('properties')}
            >
              <span className="text-xl">📦</span>
              {sidebarOpen && <span className="mr-3">العقارات</span>}
            </button>
            
            <button 
              className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                activeTab === 'payments' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('payments')}
            >
              <span className="text-xl">💰</span>
              {sidebarOpen && <span className="mr-3">المدفوعات</span>}
            </button>
            
            <button 
              className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                activeTab === 'messages' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('messages')}
            >
              <span className="text-xl">💬</span>
              {sidebarOpen && <span className="mr-3">الرسائل</span>}
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
            {activeTab === 'bookings' && 'حجوزاتي'}
            {activeTab === 'properties' && 'العقارات'}
            {activeTab === 'payments' && 'المدفوعات'}
            {activeTab === 'messages' && 'الرسائل'}
          </h2>
          <div className="flex items-center space-x-4">
            <SmartSyncIndicator />
            <button className="p-2 rounded-full hover:bg-gray-100">
              <span className="text-xl">🔔</span>
            </button>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
              <span className="text-sm">👤</span>
            </div>
          </div>
        </header>

        {/* المحتوى */}
        <main className="p-6">
          {activeTab === 'overview' && (
            <UnifiedDashboard userType="customer" userId="user_123" />
          )}
          
          {activeTab === 'overview_old' && (
            <>
              {/* إحصائيات سريعة */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {customerStats.map(stat => (
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
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">حجوزاتي الحديثة</h3>
                  <InstantLink href="/profile/bookings" className="text-blue-600 text-sm hover:underline">
                    عرض الكل
                  </InstantLink>
                </div>
                
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-right text-sm text-gray-500 border-b">
                          <th className="pb-3 px-4">الحالة</th>
                          <th className="pb-3 px-4">المبلغ</th>
                          <th className="pb-3 px-4">التاريخ</th>
                          <th className="pb-3 px-4">العقار</th>
                          <th className="pb-3 px-4">رقم الحجز</th>
                          <th className="pb-3 px-4">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.slice(0, 5).map(booking => (
                          <tr key={booking.id} className="text-sm border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                                {getStatusLabel(booking.status)}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-medium">
                              {booking.totalAmount?.toLocaleString()} ر.ع
                            </td>
                            <td className="py-3 px-4 text-gray-500">
                              {formatDate(booking.createdAt)}
                            </td>
                            <td className="py-3 px-4">
                              {booking.propertyTitle || 'غير محدد'}
                            </td>
                            <td className="py-3 px-4 font-medium">
                              {booking.bookingNumber}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <InstantLink 
                                  href={`/admin/bookings/${booking.id}`}
                                  className="text-blue-600 hover:underline text-xs"
                                >
                                  <span className="text-sm">👁️</span>
                                </InstantLink>
                                <InstantLink 
                                  href={`/properties/${booking.propertyId}`}
                                  className="text-green-600 hover:underline text-xs"
                                >
                                  <span className="text-sm">📦</span>
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
            </>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">جميع حجوزاتي</h3>
                <InstantLink 
                  href="/profile/bookings" 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  عرض التفاصيل
                </InstantLink>
              </div>
              <p className="text-gray-600">
                يمكنك عرض وإدارة جميع حجوزاتك من صفحة الحجوزات التفصيلية
              </p>
            </div>
          )}

          {activeTab === 'properties' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">العقارات المستأجرة</h3>
                <InstantLink 
                  href="/properties" 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  تصفح العقارات
                </InstantLink>
              </div>
              <p className="text-gray-600">
                تصفح العقارات المتاحة أو عرض العقارات التي تستأجرها حالياً
              </p>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">المدفوعات</h3>
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                  <span className="inline ml-1">➕</span>
                  دفع جديد
                </button>
              </div>
              <p className="text-gray-600">
                عرض سجل المدفوعات وإدارة الفواتير
              </p>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">الرسائل</h3>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                  <span className="inline ml-1">➕</span>
                  رسالة جديدة
                </button>
              </div>
              <p className="text-gray-600">
                التواصل مع إدارة العقار والاستفسارات
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}



