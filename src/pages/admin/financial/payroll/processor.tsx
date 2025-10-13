// src/pages/admin/financial/payroll/processor.tsx - مسيّر الرواتب
import React, { useState } from 'react';
import Head from 'next/head';
import { FiCalendar, FiPlus, FiX, FiSave, FiPlay } from 'react-icons/fi';

export default function PayrollProcessorPage() {
  const [showRunModal, setShowRunModal] = useState(false);
  const [formData, setFormData] = useState({
    month: new Date().toISOString().slice(0, 7),
    employees: 'all'
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>مسيّر الرواتب</title></Head>
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FiCalendar className="text-blue-600" />
              مسيّر الرواتب
            </h1>
            <p className="text-gray-600 mt-2">معالجة وحساب رواتب الموظفين شهرياً</p>
          </div>
          <button
            onClick={() => setShowRunModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <FiPlay />
            تشغيل الرواتب
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">45</p>
              <p className="text-xs text-gray-600">موظف</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">67,500</p>
              <p className="text-xs text-gray-600">إجمالي الرواتب</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">5,400</p>
              <p className="text-xs text-gray-600">الخصومات</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">62,100</p>
              <p className="text-xs text-gray-600">الصافي</p>
            </div>
          </div>
          
          <p className="text-gray-600 text-center py-4">آخر تشغيل: سبتمبر 2025</p>
        </div>

        {showRunModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full">
              <div className="bg-blue-600 p-6 text-white flex items-center justify-between">
                <h2 className="text-2xl font-bold">تشغيل الرواتب</h2>
                <button onClick={() => setShowRunModal(false)} className="text-white p-2 rounded hover:bg-white hover:bg-opacity-20">
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">الشهر *</label>
                  <input
                    type="month"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 font-medium mb-2">سيتم حساب:</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>✓ الرواتب الأساسية</li>
                    <li>✓ البدلات والحوافز</li>
                    <li>✓ الخصومات والقروض</li>
                    <li>✓ التأمينات الاجتماعية</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t">
                <button onClick={() => setShowRunModal(false)} className="px-6 py-2 border rounded-lg">إلغاء</button>
                <button
                  onClick={() => {
                    alert('جاري تشغيل الرواتب...');
                    setTimeout(() => {
                      alert('تم تشغيل رواتب 45 موظف بنجاح!');
                      setShowRunModal(false);
                    }, 1000);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <FiPlay className="inline ml-2" />
                  تشغيل
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
