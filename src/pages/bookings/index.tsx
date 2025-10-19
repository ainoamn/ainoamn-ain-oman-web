// @ts-nocheck
// src/pages/bookings/index.tsx
// صفحة الحجوزات - تصميم حديث وجميل ⚡

import { useState, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import InstantLink from '@/components/InstantLink';
import { useBookings } from '@/context/BookingsContext';
import { toSafeText } from '@/components/SafeText';
import { FaCalendar, FaHome, FaMoneyBillWave, FaCheckCircle, FaClock, FaTimes, FaSearch, FaFilter, FaSortAmountDown, FaEye, FaChevronRight, FaInfoCircle, FaUser, FaPhone } from 'react-icons/fa';

interface FilterOptions {
  search: string;
  status: string;
  sortBy: string;
}

export default function BookingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { bookings: allBookings, loading, error, lastUpdate, refresh } = useBookings();
  
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'all',
    sortBy: 'latest'
  });
  
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // فلترة الحجوزات للمستخدم الحالي فقط
  const userBookings = useMemo(() => {
    const userId = session?.user?.id;
    const userPhone = session?.user?.phone;
    const userEmail = session?.user?.email;
    
    console.log('🔍 Bookings Page: Filtering bookings...');
    console.log('👤 User info:', { userId, userPhone, userEmail });
    console.log('📦 All bookings count:', allBookings.length);
    
    // ✅ مؤقتاً: عرض جميع الحجوزات للاختبار (بدون فلترة)
    // يمكنك تفعيل الفلترة لاحقاً عند الحاجة
    console.log('⚠️ Showing ALL bookings (no filter for testing)');
    return allBookings;
    
    /* الفلترة الأصلية (معطلة مؤقتاً):
    const filtered = allBookings.filter(b => 
      b.customerInfo?.phone === userPhone ||
      b.customerInfo?.email === userEmail ||
      b.tenant?.phone === userPhone ||
      b.tenant?.email === userEmail
    );
    
    console.log('✅ Filtered bookings count:', filtered.length);
    if (filtered.length > 0) {
      console.log('📋 Sample filtered booking:', filtered[0]);
    }
    
    return filtered;
    */
  }, [allBookings, session]);

  // تطبيق الفلاتر
  const filteredBookings = useMemo(() => {
    let result = [...userBookings];

    // فلترة البحث
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(b => 
        b.bookingNumber?.toLowerCase().includes(searchLower) ||
        b.propertyId?.toLowerCase().includes(searchLower) ||
        toSafeText(b.propertyTitle, 'ar').toLowerCase().includes(searchLower)
      );
    }

    // فلترة الحالة
    if (filters.status !== 'all') {
      result = result.filter(b => b.status === filters.status);
    }

    // الترتيب
    result.sort((a, b) => {
      if (filters.sortBy === 'latest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (filters.sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (filters.sortBy === 'amount') {
        return (b.totalAmount || 0) - (a.totalAmount || 0);
      }
      return 0;
    });

    return result;
  }, [userBookings, filters]);

  // إحصائيات
  const stats = useMemo(() => {
    return {
      total: userBookings.length,
      pending: userBookings.filter(b => b.status === 'pending').length,
      confirmed: userBookings.filter(b => b.status === 'reserved' || b.status === 'paid').length,
      completed: userBookings.filter(b => b.status === 'leased').length,
      cancelled: userBookings.filter(b => b.status === 'cancelled').length,
    };
  }, [userBookings]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reserved':
      case 'paid': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'leased': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد المراجعة';
      case 'reserved': return 'محجوز';
      case 'paid': return 'تم الدفع';
      case 'leased': return 'مؤجّر';
      case 'cancelled': return 'ملغى';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <FaClock className="text-yellow-600" />;
      case 'reserved':
      case 'paid': return <FaCheckCircle className="text-blue-600" />;
      case 'leased': return <FaCheckCircle className="text-green-600" />;
      case 'cancelled': return <FaTimes className="text-red-600" />;
      default: return <FaInfoCircle />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn', 
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ar-OM', {
      style: 'currency',
      currency: 'OMR',
      maximumFractionDigits: 3
    }).format(amount || 0);
  };

  // ✅ مؤقتاً: إلغاء التحقق من تسجيل الدخول للاختبار
  /* 
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">يجب تسجيل الدخول</h2>
          <p className="text-gray-600 mb-6">يرجى تسجيل الدخول لعرض حجوزاتك</p>
          <InstantLink
            href="/login"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-block"
          >
            تسجيل الدخول
          </InstantLink>
        </div>
      </div>
    );
  }
  */

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Head>
        <title>حجوزاتي | Ain Oman</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">حجوزاتي</h1>
              <p className="text-gray-600">
                إدارة ومتابعة جميع حجوزاتك العقارية
                {lastUpdate && (
                  <span className="text-sm mr-2">
                    • آخر تحديث: {formatDate(lastUpdate.toISOString())}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => refresh()}
              className="bg-white px-4 py-2 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
            >
              <FaSortAmountDown className="inline ml-2" />
              تحديث
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-sm text-gray-600 mb-1">الإجمالي</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 shadow-sm border border-yellow-100">
              <div className="text-sm text-yellow-700 mb-1">قيد المراجعة</div>
              <div className="text-2xl font-bold text-yellow-800">{stats.pending}</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 shadow-sm border border-blue-100">
              <div className="text-sm text-blue-700 mb-1">محجوز</div>
              <div className="text-2xl font-bold text-blue-800">{stats.confirmed}</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 shadow-sm border border-green-100">
              <div className="text-sm text-green-700 mb-1">مؤجّر</div>
              <div className="text-2xl font-bold text-green-800">{stats.completed}</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 shadow-sm border border-red-100">
              <div className="text-sm text-red-700 mb-1">ملغى</div>
              <div className="text-2xl font-bold text-red-800">{stats.cancelled}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="بحث برقم الحجز أو العقار..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="pending">قيد المراجعة</option>
                  <option value="reserved">محجوز</option>
                  <option value="paid">تم الدفع</option>
                  <option value="leased">مؤجّر</option>
                  <option value="cancelled">ملغى</option>
                </select>
              </div>

              {/* Sort */}
              <div className="relative">
                <FaSortAmountDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                >
                  <option value="latest">الأحدث أولاً</option>
                  <option value="oldest">الأقدم أولاً</option>
                  <option value="amount">الأعلى قيمة</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري التحميل...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <FaTimes className="text-4xl text-red-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-red-800 mb-2">حدث خطأ</h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => refresh()}
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredBookings.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
            <FaHome className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">لا توجد حجوزات</h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.status !== 'all'
                ? 'لم يتم العثور على نتائج مطابقة للفلاتر المختارة'
                : 'لم تقم بأي حجوزات بعد'}
            </p>
            <InstantLink
              href="/properties"
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors inline-block"
            >
              تصفح العقارات
            </InstantLink>
          </div>
        )}

        {/* Bookings List */}
        {!loading && !error && filteredBookings.length > 0 && (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {toSafeText(booking.propertyTitle, 'ar', booking.propertyId)}
                        </h3>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="font-medium">{getStatusLabel(booking.status)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaCalendar className="text-gray-400" />
                        <span>رقم الحجز: {booking.bookingNumber}</span>
                        <span className="text-gray-400">•</span>
                        <span>{formatDate(booking.createdAt)}</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-3xl font-bold text-green-600">
                        {formatAmount(booking.totalAmount || booking.totalRent || 0)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {booking.durationMonths || booking.duration || 0} شهر
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <FaCalendar className="text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">تاريخ البدء</div>
                        <div className="font-medium">{formatDate(booking.startDate)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                        <FaUser className="text-purple-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">المستأجر</div>
                        <div className="font-medium">
                          {booking.customerInfo?.name || booking.tenant?.name || 'غير محدد'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <FaPhone className="text-green-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">الهاتف</div>
                        <div className="font-medium">
                          {booking.customerInfo?.phone || booking.tenant?.phone || 'غير محدد'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex gap-3">
                      <InstantLink
                        href={`/properties/${booking.propertyId}`}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <FaHome />
                        <span>عرض العقار</span>
                      </InstantLink>
                    </div>

                    <InstantLink
                      href={`/admin/bookings/${booking.id}`}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FaEye />
                      <span>التفاصيل الكاملة</span>
                      <FaChevronRight />
                    </InstantLink>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">هل تبحث عن عقار جديد؟</h3>
              <p className="text-green-50">تصفح آلاف العقارات المتاحة للإيجار في جميع أنحاء عُمان</p>
            </div>
            <InstantLink
              href="/properties"
              className="bg-white text-green-600 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-bold flex items-center gap-2"
            >
              <span>تصفح العقارات</span>
              <FaChevronRight />
            </InstantLink>
          </div>
        </div>
      </div>
    </div>
  );
}
