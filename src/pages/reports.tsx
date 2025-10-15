// src/pages/reports.tsx - صفحة التقارير المتقدمة
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  FiDownload, FiFilter, FiCalendar, FiDollarSign, 
  FiHome, FiUsers, FiTrendingUp, FiBarChart2,
  FiPieChart, FiActivity
} from 'react-icons/fi';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('financial');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const financialData = [
    { month: 'يناير', revenue: 45000, expenses: 28000, profit: 17000 },
    { month: 'فبراير', revenue: 52000, expenses: 31000, profit: 21000 },
    { month: 'مارس', revenue: 68000, expenses: 35000, profit: 33000 },
    { month: 'أبريل', revenue: 75000, expenses: 38000, profit: 37000 },
    { month: 'مايو', revenue: 71000, expenses: 36000, profit: 35000 },
    { month: 'يونيو', revenue: 89000, expenses: 42000, profit: 47000 }
  ];

  const propertyData = [
    { name: 'شقق', value: 45, count: 120 },
    { name: 'فلل', value: 30, count: 80 },
    { name: 'مكاتب', value: 15, count: 40 },
    { name: 'محلات', value: 10, count: 25 }
  ];

  const occupancyData = [
    { month: 'يناير', rate: 85 },
    { month: 'فبراير', rate: 88 },
    { month: 'مارس', rate: 92 },
    { month: 'أبريل', rate: 90 },
    { month: 'مايو', rate: 87 },
    { month: 'يونيو', rate: 94 }
  ];

  const exportReport = (format: string) => {
    alert(`سيتم تصدير التقرير بصيغة ${format}`);
  };

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>التقارير | Ain Oman</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">📊 التقارير المتقدمة</h1>
                <p className="text-gray-600 mt-1">تحليل شامل للأداء والإحصائيات</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => exportReport('PDF')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  <FiDownload className="inline ml-2" />
                  PDF
                </button>
                <button
                  onClick={() => exportReport('Excel')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  <FiDownload className="inline ml-2" />
                  Excel
                </button>
              </div>
            </div>

            {/* الفلاتر */}
            <div className="flex gap-4 flex-wrap">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FiCalendar className="inline ml-1" />
                  الفترة الزمنية
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="week">هذا الأسبوع</option>
                  <option value="month">هذا الشهر</option>
                  <option value="quarter">هذا الربع</option>
                  <option value="year">هذا العام</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FiFilter className="inline ml-1" />
                  نوع التقرير
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="financial">مالي</option>
                  <option value="properties">العقارات</option>
                  <option value="occupancy">الإشغال</option>
                  <option value="performance">الأداء</option>
                </select>
              </div>
            </div>
          </div>

          {/* الإحصائيات السريعة */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'إجمالي الإيرادات', value: '400,000 ر.ع', icon: FiDollarSign, color: 'green' },
              { label: 'عدد العقارات', value: '265', icon: FiHome, color: 'blue' },
              { label: 'معدل الإشغال', value: '89%', icon: FiActivity, color: 'purple' },
              { label: 'عدد المستأجرين', value: '450', icon: FiUsers, color: 'orange' }
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6">
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* الرسوم البيانية */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* التقرير المالي */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <FiDollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">التحليل المالي</h3>
                  <p className="text-sm text-gray-600">الإيرادات والمصروفات والأرباح</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={financialData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="expensesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="url(#revenueGrad)" name="الإيرادات" />
                  <Area type="monotone" dataKey="expenses" stroke="#EF4444" fill="url(#expensesGrad)" name="المصروفات" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* توزيع العقارات */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FiPieChart className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">توزيع العقارات</h3>
                  <p className="text-sm text-gray-600">حسب النوع</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={propertyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {propertyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* معدل الإشغال */}
            <div className="bg-white rounded-2xl shadow-xl p-6 lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FiTrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">معدل الإشغال</h3>
                  <p className="text-sm text-gray-600">تطور معدل الإشغال عبر الأشهر</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    name="معدل الإشغال (%)"
                    dot={{ r: 6, fill: '#8B5CF6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ملاحظات */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">💡 ملخص الأداء</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-blue-100 mb-2">📈 النمو</p>
                <p className="text-2xl font-bold">+18.5%</p>
                <p className="text-sm text-blue-100 mt-1">مقارنة بالشهر الماضي</p>
              </div>
              <div>
                <p className="text-blue-100 mb-2">⭐ التقييم</p>
                <p className="text-2xl font-bold">ممتاز</p>
                <p className="text-sm text-blue-100 mt-1">أداء فوق المتوسط</p>
              </div>
              <div>
                <p className="text-blue-100 mb-2">🎯 التوصية</p>
                <p className="text-2xl font-bold">استمر</p>
                <p className="text-sm text-blue-100 mt-1">الأداء جيد جداً</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
