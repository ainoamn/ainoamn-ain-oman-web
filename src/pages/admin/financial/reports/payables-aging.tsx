// src/pages/admin/financial/reports/payables-aging.tsx - تقادم الدائنون
import React from 'react';
import Head from 'next/head';
import { FiClock } from 'react-icons/fi';

export default function PayablesAgingPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>تقادم الحسابات الدائنة</title></Head>
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-8">
          <FiClock className="text-red-600" />
          تقادم الحسابات الدائنة
        </h1>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600">تحليل أعمار الديون المستحقة للموردين</p>
        </div>
      </div>
    </div>
  );
}

