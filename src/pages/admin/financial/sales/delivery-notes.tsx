// src/pages/admin/financial/sales/delivery-notes.tsx - إشعارات تسليم
import React, { useState } from 'react';
import Head from 'next/head';
import { FiPackage, FiPlus, FiX, FiSave } from 'react-icons/fi';

export default function DeliveryNotesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    invoiceNumber: '',
    items: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    receivedBy: ''
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>إشعارات تسليم - المبيعات</title></Head>
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FiPackage className="text-cyan-600" />
              إشعارات تسليم
            </h1>
            <p className="text-gray-600 mt-2">إشعارات تسليم البضائع للعملاء</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-cyan-700"
          >
            <FiPlus />
            إشعار تسليم جديد
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600 text-center py-8">لا توجد إشعارات تسليم</p>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full">
              <div className="bg-cyan-600 p-6 text-white flex items-center justify-between">
                <h2 className="text-2xl font-bold">إشعار تسليم جديد</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-white p-2 rounded hover:bg-white hover:bg-opacity-20">
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">العميل *</label>
                  <select
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">اختر العميل...</option>
                    <option value="أحمد السالمي">أحمد السالمي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">رقم الفاتورة</label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="INV-2025-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">تاريخ التسليم</label>
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">المستلم</label>
                  <input
                    type="text"
                    value={formData.receivedBy}
                    onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="اسم المستلم"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t">
                <button onClick={() => setShowCreateModal(false)} className="px-6 py-2 border rounded-lg">إلغاء</button>
                <button
                  onClick={() => {
                    if (!formData.customer) {
                      alert('الرجاء اختيار العميل');
                      return;
                    }
                    alert('تم إنشاء إشعار التسليم!');
                    setShowCreateModal(false);
                  }}
                  className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
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
