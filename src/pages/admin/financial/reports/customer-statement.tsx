// src/pages/admin/financial/reports/customer-statement.tsx - كشف حساب عميل
import React from 'react';
import Head from 'next/head';
import { FiFileText } from 'react-icons/fi';

export default function CustomerStatementPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>كشف حساب عميل</title></Head>
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-8">
          <FiFileText className="text-blue-600" />
          كشف حساب عميل
        </h1>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600">كشف حساب تفصيلي لعميل معين</p>
        </div>
      </div>
    </div>
  );
}

