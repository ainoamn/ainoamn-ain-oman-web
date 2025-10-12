// Income Statement - قائمة الدخل
import React from 'react';
import Head from 'next/head';
import { FiBarChart, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export default function IncomeStatementPage() {
  const data = {
    revenue: { rent: 85420, service: 22150, subscription: 12450, total: 120020 },
    expenses: { maintenance: 25420, utilities: 15670, salaries: 18950, total: 60040 },
    netIncome: 59980
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>قائمة الدخل</title></Head>
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <FiBarChart className="text-green-600" />
        قائمة الدخل (Income Statement)
      </h1>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
            <FiTrendingUp /> الإيرادات
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between p-2"><span>إيرادات الإيجارات</span><span>{data.revenue.rent.toLocaleString()} ر.ع</span></div>
            <div className="flex justify-between p-2"><span>إيرادات الخدمات</span><span>{data.revenue.service.toLocaleString()} ر.ع</span></div>
            <div className="flex justify-between p-2"><span>إيرادات الاشتراكات</span><span>{data.revenue.subscription.toLocaleString()} ر.ع</span></div>
            <div className="flex justify-between p-3 bg-green-50 font-bold"><span>إجمالي الإيرادات</span><span>{data.revenue.total.toLocaleString()} ر.ع</span></div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
            <FiTrendingDown /> المصروفات
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between p-2"><span>الصيانة</span><span>{data.expenses.maintenance.toLocaleString()} ر.ع</span></div>
            <div className="flex justify-between p-2"><span>المرافق</span><span>{data.expenses.utilities.toLocaleString()} ر.ع</span></div>
            <div className="flex justify-between p-2"><span>الرواتب</span><span>{data.expenses.salaries.toLocaleString()} ر.ع</span></div>
            <div className="flex justify-between p-3 bg-red-50 font-bold"><span>إجمالي المصروفات</span><span>{data.expenses.total.toLocaleString()} ر.ع</span></div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg font-bold text-lg flex justify-between">
          <span>صافي الربح (Net Income)</span>
          <span>{data.netIncome.toLocaleString()} ر.ع</span>
        </div>
      </div>
    </div>
  );
}

