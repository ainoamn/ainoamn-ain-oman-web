// src/pages/admin/financial/reports/vendor-statement.tsx - كشف حساب مورد
import React from 'react';
import Head from 'next/head';
import { FiFileText } from 'react-icons/fi';

export default function VendorStatementPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>كشف حساب مورد</title></Head>
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-8">
          <FiFileText className="text-purple-600" />
          كشف حساب مورد
        </h1>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600">كشف حساب تفصيلي لمورد معين</p>
        </div>
      </div>
    </div>
  );
}

