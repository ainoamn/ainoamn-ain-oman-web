// src/pages/admin/financial/purchases/debit-notes.tsx - إشعارات مدينة
import React, { useState } from 'react';
import Head from 'next/head';
import { FiCreditCard, FiPlus, FiX, FiSave } from 'react-icons/fi';

export default function DebitNotesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    vendor: '',
    originalInvoice: '',
    amount: 0,
    reason: ''
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>إشعارات مدينة</title></Head>
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FiCreditCard className="text-purple-600" />
            إشعارات مدينة
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
          >
            <FiPlus />
            إشعار مدين جديد
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600 text-center py-8">لا توجد إشعارات مدينة</p>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full">
              <div className="bg-purple-600 p-6 text-white flex items-center justify-between">
                <h2 className="text-2xl font-bold">إشعار مدين جديد</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-white p-2 rounded hover:bg-white hover:bg-opacity-20">
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">المورد *</label>
                  <select
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">اختر المورد...</option>
                    <option value="شركة التوريدات">شركة التوريدات</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">الفاتورة الأصلية</label>
                    <input
                      type="text"
                      value={formData.originalInvoice}
                      onChange={(e) => setFormData({ ...formData, originalInvoice: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
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

                <div>
                  <label className="block text-sm font-medium mb-2">السبب</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t">
                <button onClick={() => setShowCreateModal(false)} className="px-6 py-2 border rounded-lg">إلغاء</button>
                <button
                  onClick={() => {
                    if (!formData.vendor || formData.amount <= 0) {
                      alert('الرجاء ملء الحقول');
                      return;
                    }
                    alert('تم إنشاء الإشعار المدين!');
                    setShowCreateModal(false);
                  }}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
