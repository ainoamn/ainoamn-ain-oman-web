// src/pages/admin/financial/data-migration.tsx - نظام نقل البيانات
import React, { useState } from 'react';
import Head from 'next/head';
import { FiUpload, FiDownload, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';

export default function DataMigrationPage() {
  const [selectedSystem, setSelectedSystem] = useState('');

  const supportedSystems = [
    { id: 'qoyod', name: 'Qoyod', logo: '💼' },
    { id: 'daftra', name: 'Daftra', logo: '📊' },
    { id: 'xero', name: 'Xero', logo: '🔵' },
    { id: 'zoho', name: 'Zoho Books', logo: '📚' },
    { id: 'quickbooks', name: 'Quickbooks', logo: '🟢' },
    { id: 'tally', name: 'تالي', logo: '📗' },
    { id: 'sage', name: 'Sage', logo: '🟤' },
    { id: 'excel', name: 'Excel / CSV', logo: '📊' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>نقل البيانات - النظام المالي</title></Head>

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiRefreshCw className="text-indigo-600" />
            أداة نقل البيانات
          </h1>
          <p className="text-gray-600 mt-2">انقل بياناتك من برنامج المحاسبة القديم إلى عين عمان</p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-r-4 border-blue-500 p-6 rounded-lg mb-8">
          <h3 className="font-bold text-blue-900 mb-2">📋 ما الذي يمكن نقله؟</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ دليل الحسابات المحاسبية</li>
            <li>✓ العملاء والموردين وجهات الاتصال</li>
            <li>✓ المنتجات والخدمات</li>
            <li>✓ الفواتير والمدفوعات</li>
            <li>✓ الأرصدة الافتتاحية</li>
            <li>✓ القيود المحاسبية</li>
          </ul>
        </div>

        {/* System Selection */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">ما هو البرنامج الذي ستنقل بياناتك منه؟</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {supportedSystems.map((system) => (
              <div
                key={system.id}
                onClick={() => setSelectedSystem(system.id)}
                className={`p-6 border-2 rounded-xl cursor-pointer transition-all text-center ${
                  selectedSystem === system.id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className="text-4xl mb-2">{system.logo}</div>
                <h3 className="font-bold text-gray-900">{system.name}</h3>
                {selectedSystem === system.id && (
                  <FiCheckCircle className="text-indigo-600 mx-auto mt-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upload Section */}
        {selectedSystem && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">رفع ملف البيانات</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
              <FiUpload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">اسحب الملف هنا أو انقر للتحميل</h3>
              <p className="text-sm text-gray-600 mb-4">الصيغ المدعومة: Excel (.xlsx), CSV, JSON</p>
              
              <label className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-indigo-700">
                <FiUpload />
                <span>اختر ملف</span>
                <input type="file" className="hidden" accept=".xlsx,.csv,.json" />
              </label>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-2">📥 الخطوة 1</h4>
                <p className="text-gray-600">تصدير البيانات من نظامك القديم</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-2">📤 الخطوة 2</h4>
                <p className="text-gray-600">رفع الملف إلى عين عمان</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-2">✅ الخطوة 3</h4>
                <p className="text-gray-600">مراجعة وتأكيد البيانات</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

