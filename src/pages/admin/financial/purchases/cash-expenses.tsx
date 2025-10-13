// src/pages/admin/financial/purchases/cash-expenses.tsx - مصروفات نقدية
import React, { useState } from 'react';
import Head from 'next/head';
import { FiDollarSign, FiPlus, FiX, FiSave } from 'react-icons/fi';

export default function CashExpensesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>مصروفات نقدية</title></Head>
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FiDollarSign className="text-orange-600" />
            مصروفات نقدية
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700"
          >
            <FiPlus />
            مصروف نقدي جديد
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600 text-center py-8">لا توجد مصروفات نقدية</p>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full">
              <div className="bg-orange-600 p-6 text-white flex items-center justify-between">
                <h2 className="text-2xl font-bold">مصروف نقدي جديد</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-white p-2 rounded hover:bg-white hover:bg-opacity-20">
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">الوصف *</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">الفئة</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">اختر...</option>
                      <option value="transport">نقل</option>
                      <option value="maintenance">صيانة</option>
                      <option value="supplies">لوازم</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">المبلغ *</label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border rounded-lg"
                      step="0.001"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t">
                <button onClick={() => setShowCreateModal(false)} className="px-6 py-2 border rounded-lg">إلغاء</button>
                <button
                  onClick={() => {
                    if (!formData.description || formData.amount <= 0) {
                      alert('الرجاء ملء الحقول');
                      return;
                    }
                    alert('تم تسجيل المصروف!');
                    setShowCreateModal(false);
                  }}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  <FiSave className="inline ml-2" />
                  حفظ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
