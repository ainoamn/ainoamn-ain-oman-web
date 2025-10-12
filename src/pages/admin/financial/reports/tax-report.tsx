// src/pages/admin/financial/reports/tax-report.tsx - تقرير الضرائب
import React from 'react';
import Head from 'next/head';
import { FiPercent } from 'react-icons/fi';

export default function TaxReportPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>تقرير الضرائب</title></Head>
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-8">
          <FiPercent className="text-indigo-600" />
          تقرير الضرائب
        </h1>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600">تقرير شامل للضرائب المستحقة والمدفوعة</p>
        </div>
      </div>
    </div>
  );
}

