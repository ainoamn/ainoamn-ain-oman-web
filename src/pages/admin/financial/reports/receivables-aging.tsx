// src/pages/admin/financial/reports/receivables-aging.tsx - تقادم المدينون
import React from 'react';
import Head from 'next/head';
import { FiClock } from 'react-icons/fi';

export default function ReceivablesAgingPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>تقادم الحسابات المدينة</title></Head>
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-8">
          <FiClock className="text-orange-600" />
          تقادم الحسابات المدينة
        </h1>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600">تحليل أعمار الديون المستحقة على العملاء</p>
        </div>
      </div>
    </div>
  );
}

