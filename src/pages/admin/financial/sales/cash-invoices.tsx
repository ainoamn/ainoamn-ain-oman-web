// src/pages/admin/financial/sales/cash-invoices.tsx - فواتير نقدية
import React, { useState } from 'react';
import Head from 'next/head';
import { FiDollarSign, FiPlus, FiX, FiSave } from 'react-icons/fi';

export default function CashInvoicesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    items: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>فواتير نقدية - المبيعات</title></Head>
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FiDollarSign className="text-teal-600" />
              فواتير نقدية
            </h1>
            <p className="text-gray-600 mt-2">فواتير البيع النقدي المباشر (نقطة البيع)</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-teal-700"
          >
            <FiPlus />
            فاتورة نقدية جديدة
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600 text-center py-8">لا توجد فواتير نقدية</p>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full">
              <div className="bg-teal-600 p-6 text-white flex items-center justify-between">
                <h2 className="text-2xl font-bold">فاتورة نقدية جديدة</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-white p-2 rounded hover:bg-white hover:bg-opacity-20">
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">العميل</label>
                  <input
                    type="text"
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="اسم العميل (اختياري)"
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

              <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t">
                <button onClick={() => setShowCreateModal(false)} className="px-6 py-2 border rounded-lg">إلغاء</button>
                <button
                  onClick={() => {
                    if (formData.amount <= 0) {
                      alert('الرجاء إدخال المبلغ');
                      return;
                    }
                    alert('تم إصدار الفاتورة النقدية!');
                    setShowCreateModal(false);
                  }}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
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
