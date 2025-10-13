// src/pages/admin/financial/inventory/adjustments.tsx - تعديلات المخزون
import React, { useState } from 'react';
import Head from 'next/head';
import { FiTrendingUp, FiPlus, FiX, FiSave } from 'react-icons/fi';

export default function InventoryAdjustmentsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    product: '',
    type: 'increase',
    quantity: 0,
    reason: '',
    date: new Date().toISOString().split('T')[0]
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>تعديلات المخزون</title></Head>
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FiTrendingUp className="text-orange-600" />
            تعديلات المخزون
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700"
          >
            <FiPlus />
            تعديل جديد
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600 text-center py-8">لا توجد تعديلات</p>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full">
              <div className="bg-orange-600 p-6 text-white flex items-center justify-between">
                <h2 className="text-2xl font-bold">تعديل مخزون جديد</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-white p-2 rounded hover:bg-white hover:bg-opacity-20">
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">المنتج *</label>
                  <select
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">اختر المنتج...</option>
                    <option value="PRD-001">منتج 1</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">النوع</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="increase">زيادة</option>
                      <option value="decrease">نقصان</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">الكمية *</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border rounded-lg"
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
                    if (!formData.product || formData.quantity <= 0) {
                      alert('الرجاء ملء الحقول');
                      return;
                    }
                    alert('تم تسجيل التعديل!');
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
