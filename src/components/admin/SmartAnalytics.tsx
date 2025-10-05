// src/components/admin/SmartAnalytics.tsx - تحليلات ذكية مع الذكاء الاصطناعي
import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar, 
  Building,
  Target,
  Zap,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface Booking {
  id: string;
  bookingNumber: string;
  propertyId: string;
  propertyTitle?: string;
  propertyReference?: string;
  startDate: string;
  duration: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  contractSigned?: boolean;
  customerInfo: { name: string; phone: string; email?: string };
  ownerDecision?: { approved?: boolean; reason?: string; decidedAt?: string } | null;
}

interface SmartAnalyticsProps {
  data: Booking[];
}

export default function SmartAnalytics({ data }: SmartAnalyticsProps) {
  // تحليلات ذكية
  const analytics = useMemo(() => {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // إحصائيات أساسية
    const totalBookings = data.length;
    const totalRevenue = data.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    const avgBookingValue = totalRevenue / totalBookings || 0;

    // تحليل الحالات
    const statusCounts = data.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // تحليل الاتجاهات الزمنية
    const recentBookings = data.filter(item => new Date(item.createdAt) >= lastWeek);
    const monthlyBookings = data.filter(item => new Date(item.createdAt) >= lastMonth);

    // تحليل العملاء
    const uniqueCustomers = new Set(data.map(item => item.customerInfo?.name)).size;
    const repeatCustomers = data.filter((item, index, arr) => 
      arr.findIndex(other => other.customerInfo?.name === item.customerInfo?.name) !== index
    ).length;

    // تحليل العقارات
    const uniqueProperties = new Set(data.map(item => item.propertyId)).size;
    const topProperties = Object.entries(
      data.reduce((acc, item) => {
        acc[item.propertyId] = (acc[item.propertyId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).sort(([,a], [,b]) => b - a).slice(0, 3);

    // تحليل الأداء
    const conversionRate = ((statusCounts.leased || 0) / totalBookings) * 100;
    const pendingRate = ((statusCounts.pending || 0) / totalBookings) * 100;

    return {
      totalBookings,
      totalRevenue,
      avgBookingValue,
      statusCounts,
      recentBookings: recentBookings.length,
      monthlyBookings: monthlyBookings.length,
      uniqueCustomers,
      repeatCustomers,
      uniqueProperties,
      topProperties,
      conversionRate,
      pendingRate
    };
  }, [data]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-OM", {
      style: "currency",
      currency: "OMR",
      maximumFractionDigits: 3
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      reserved: 'text-blue-600 bg-blue-100',
      leased: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100',
      accounting: 'text-purple-600 bg-purple-100'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'قيد المراجعة',
      reserved: 'محجوز',
      leased: 'مؤجّر',
      cancelled: 'ملغى',
      accounting: 'محاسبي'
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="space-y-6">
      {/* بطاقات الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">إجمالي الحجوزات</p>
              <p className="text-3xl font-bold">{analytics.totalBookings}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-blue-100">
            <TrendingUp className="w-4 h-4 ml-1" />
            <span className="text-sm">+{analytics.recentBookings} هذا الأسبوع</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">إجمالي الإيرادات</p>
              <p className="text-3xl font-bold">{formatCurrency(analytics.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-100">
            <TrendingUp className="w-4 h-4 ml-1" />
            <span className="text-sm">متوسط: {formatCurrency(analytics.avgBookingValue)}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">العملاء الفريدون</p>
              <p className="text-3xl font-bold">{analytics.uniqueCustomers}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-purple-100">
            <Target className="w-4 h-4 ml-1" />
            <span className="text-sm">{analytics.repeatCustomers} عميل متكرر</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">العقارات النشطة</p>
              <p className="text-3xl font-bold">{analytics.uniqueProperties}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Building className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-orange-100">
            <Activity className="w-4 h-4 ml-1" />
            <span className="text-sm">{analytics.monthlyBookings} هذا الشهر</span>
          </div>
        </div>
      </div>

      {/* تحليل الحالات */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <PieChart className="w-5 h-5 ml-2 text-blue-600" />
            توزيع الحالات
          </h3>
          <div className="text-sm text-gray-500">
            معدل التحويل: {analytics.conversionRate.toFixed(1)}%
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(analytics.statusCounts).map(([status, count]) => {
            const percentage = (count / analytics.totalBookings) * 100;
            return (
              <div key={status} className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                  {getStatusLabel(status)}
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* العقارات الأكثر حجزاً */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <BarChart3 className="w-5 h-5 ml-2 text-green-600" />
          العقارات الأكثر حجزاً
        </h3>
        
        <div className="space-y-4">
          {analytics.topProperties.map(([propertyId, count], index) => {
            const property = data.find(item => item.propertyId === propertyId);
            const percentage = (count / analytics.totalBookings) * 100;
            
            return (
              <div key={propertyId} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {property?.propertyTitle || propertyId}
                    </div>
                    <div className="text-sm text-gray-500">
                      {property?.propertyReference || 'غير محدد'}
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-gray-900">{count} حجز</div>
                  <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* نصائح ذكية */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Zap className="w-5 h-5 ml-2 text-indigo-600" />
          نصائح ذكية
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.pendingRate > 20 && (
            <div className="bg-white rounded-xl p-4 border border-orange-200">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full ml-2"></div>
                <span className="font-medium text-orange-800">انتباه</span>
              </div>
              <p className="text-sm text-gray-700">
                معدل الحجوزات المعلقة مرتفع ({analytics.pendingRate.toFixed(1)}%). 
                يُنصح بمراجعة العملية.
              </p>
            </div>
          )}
          
          {analytics.conversionRate < 30 && (
            <div className="bg-white rounded-xl p-4 border border-red-200">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full ml-2"></div>
                <span className="font-medium text-red-800">تحسين مطلوب</span>
              </div>
              <p className="text-sm text-gray-700">
                معدل التحويل منخفض ({analytics.conversionRate.toFixed(1)}%). 
                يُنصح بتحسين عملية المتابعة.
              </p>
            </div>
          )}
          
          {analytics.repeatCustomers > 0 && (
            <div className="bg-white rounded-xl p-4 border border-green-200">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                <span className="font-medium text-green-800">إيجابي</span>
              </div>
              <p className="text-sm text-gray-700">
                لديك {analytics.repeatCustomers} عميل متكرر. 
                هذا مؤشر جيد على رضا العملاء.
              </p>
            </div>
          )}
          
          {analytics.avgBookingValue > 5000 && (
            <div className="bg-white rounded-xl p-4 border border-blue-200">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                <span className="font-medium text-blue-800">ممتاز</span>
              </div>
              <p className="text-sm text-gray-700">
                متوسط قيمة الحجز عالي ({formatCurrency(analytics.avgBookingValue)}). 
                استمر في هذا الاتجاه!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}





