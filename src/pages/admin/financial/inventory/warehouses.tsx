// src/pages/admin/financial/inventory/warehouses.tsx - المستودعات
import React, { useState } from 'react';
import Head from 'next/head';
import { FiHome, FiPlus, FiX, FiSave } from 'react-icons/fi';

export default function WarehousesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: 0,
    manager: ''
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>المستودعات</title></Head>
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FiHome className="text-purple-600" />
            المستودعات
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
          >
            <FiPlus />
            إضافة مستودع
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600 text-center py-8">لا توجد مستودعات</p>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full">
              <div className="bg-purple-600 p-6 text-white flex items-center justify-between">
                <h2 className="text-2xl font-bold">إضافة مستودع جديد</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-white p-2 rounded hover:bg-white hover:bg-opacity-20">
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">اسم المستودع *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">الموقع</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">السعة (متر مربع)</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t">
                <button onClick={() => setShowCreateModal(false)} className="px-6 py-2 border rounded-lg">إلغاء</button>
                <button
                  onClick={() => {
                    if (!formData.name) {
                      alert('الرجاء إدخال اسم المستودع');
                      return;
                    }
                    alert('تم إضافة المستودع بنجاح!');
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
