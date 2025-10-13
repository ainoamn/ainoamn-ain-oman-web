// Profit & Loss - الأرباح والخسائر
import React from 'react';
import Head from 'next/head';
import { FiTrendingUp } from 'react-icons/fi';

export default function ProfitLossPage() {
  const profit = 59980;
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>تقرير الأرباح والخسائر</title></Head>
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <FiTrendingUp className="text-teal-600" />
        تقرير الأرباح والخسائر
      </h1>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="text-center p-8">
          <p className="text-gray-600 mb-4">صافي الربح</p>
          <p className="text-5xl font-bold text-green-600">{profit.toLocaleString()} ر.ع</p>
          <p className="text-sm text-gray-500 mt-2">للفترة الحالية</p>
        </div>
      </div>
    </div>
  );
}

