// src/pages/admin/financial/reports/inventory-movement.tsx - حركة المخزون
import React from 'react';
import Head from 'next/head';
import { FiPackage } from 'react-icons/fi';

export default function InventoryMovementPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>حركة المخزون</title></Head>
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-8">
          <FiPackage className="text-teal-600" />
          حركة المخزون
        </h1>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600">تقرير تفصيلي لحركة المخزون (دخول/خروج)</p>
        </div>
      </div>
    </div>
  );
}

