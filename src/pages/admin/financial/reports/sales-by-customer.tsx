// src/pages/admin/financial/reports/sales-by-customer.tsx - المبيعات بحسب العميل
import React from 'react';
import Head from 'next/head';
import { FiUsers } from 'react-icons/fi';

export default function SalesByCustomerPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>المبيعات بحسب العميل</title></Head>
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-8">
          <FiUsers className="text-green-600" />
          المبيعات بحسب العميل
        </h1>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600">تقرير المبيعات موزعة حسب العملاء</p>
        </div>
      </div>
    </div>
  );
}

