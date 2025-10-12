// src/pages/admin/financial/purchases/purchase-orders.tsx - أوامر الشراء
import React, { useState } from 'react';
import Head from 'next/head';
import { FiClipboard, FiPlus, FiX, FiSave } from 'react-icons/fi';

export default function PurchaseOrdersPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    vendor: '',
    items: '',
    estimatedAmount: 0,
    deliveryDate: new Date().toISOString().split('T')[0]
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>أوامر الشراء</title></Head>
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FiClipboard className="text-indigo-600" />
            أوامر الشراء
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
          >
            <FiPlus />
            أمر شراء جديد
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600 text-center py-8">لا توجد أوامر شراء</p>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full">
              <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
                <h2 className="text-2xl font-bold">أمر شراء جديد</h2>
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

                <div>
                  <label className="block text-sm font-medium mb-2">المبلغ التقديري *</label>
                  <input
                    type="number"
                    value={formData.estimatedAmount}
                    onChange={(e) => setFormData({ ...formData, estimatedAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border rounded-lg"
                    step="0.001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">تاريخ التسليم المتوقع</label>
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t">
                <button onClick={() => setShowCreateModal(false)} className="px-6 py-2 border rounded-lg">إلغاء</button>
                <button
                  onClick={() => {
                    if (!formData.vendor) {
                      alert('الرجاء اختيار المورد');
                      return;
                    }
                    alert('تم إنشاء أمر الشراء!');
                    setShowCreateModal(false);
                  }}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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
