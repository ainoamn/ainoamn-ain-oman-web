// src/pages/admin/financial/purchases/vouchers.tsx - سندات الموردين (سندات الصرف)
import React, { useState } from 'react';
import Head from 'next/head';
import { FiDollarSign, FiPlus, FiX, FiSave } from 'react-icons/fi';

export default function VendorVouchersPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    vendor: '',
    amount: 0,
    paymentMethod: 'cash',
    date: new Date().toISOString().split('T')[0],
    reference: ''
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>سندات الموردين</title></Head>
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FiDollarSign className="text-green-600" />
              سندات الموردين (سندات الصرف)
            </h1>
            <p className="text-gray-600 mt-2">سندات الصرف النقدية للموردين</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
          >
            <FiPlus />
            سند صرف جديد
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600 text-center py-8">لا توجد سندات صرف</p>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full">
              <div className="bg-green-600 p-6 text-white flex items-center justify-between">
                <h2 className="text-2xl font-bold">سند صرف جديد</h2>
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
                    <option value="مؤسسة الإمدادات">مؤسسة الإمدادات</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <label className="block text-sm font-medium mb-2">طريقة الدفع</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="cash">نقدي</option>
                      <option value="bank">بنكي</option>
                      <option value="check">شيك</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t">
                <button onClick={() => setShowCreateModal(false)} className="px-6 py-2 border rounded-lg">إلغاء</button>
                <button
                  onClick={() => {
                    if (!formData.vendor || formData.amount <= 0) {
                      alert('الرجاء ملء الحقول المطلوبة');
                      return;
                    }
                    alert('تم إنشاء سند الصرف!');
                    setShowCreateModal(false);
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
