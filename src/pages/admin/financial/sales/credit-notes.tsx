// src/pages/admin/financial/sales/credit-notes.tsx - إشعارات دائنة
import React, { useState } from 'react';
import Head from 'next/head';
import { FiCreditCard, FiPlus, FiX, FiSave } from 'react-icons/fi';

interface CreditNote {
  id: string;
  noteNumber: string;
  customer: string;
  originalInvoice: string;
  amount: number;
  reason: string;
  date: string;
}

export default function CreditNotesPage() {
  const [notes, setNotes] = useState<CreditNote[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    originalInvoice: '',
    amount: 0,
    reason: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleCreate = () => {
    if (!formData.customer || formData.amount <= 0) {
      alert('الرجاء ملء الحقول المطلوبة');
      return;
    }

    const newNote: CreditNote = {
      id: Date.now().toString(),
      noteNumber: `CN-2025-${String(notes.length + 1).padStart(3, '0')}`,
      customer: formData.customer,
      originalInvoice: formData.originalInvoice,
      amount: formData.amount,
      reason: formData.reason,
      date: formData.date
    };

    setNotes([...notes, newNote]);
    setShowCreateModal(false);
    alert('تم إضافة الإشعار الدائن بنجاح!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>إشعارات دائنة - المبيعات</title></Head>
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FiCreditCard className="text-orange-600" />
              إشعارات دائنة
            </h1>
            <p className="text-gray-600 mt-2">إشعارات الإرجاع والخصومات للعملاء</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700"
          >
            <FiPlus />
            إشعار دائن جديد
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          {notes.length === 0 && (
            <div className="text-center py-12 text-gray-600">
              لا توجد إشعارات دائنة
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full">
              <div className="bg-orange-600 p-6 text-white flex items-center justify-between">
                <h2 className="text-2xl font-bold">إشعار دائن جديد</h2>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">الفاتورة الأصلية</label>
                    <input
                      type="text"
                      value={formData.originalInvoice}
                      onChange={(e) => setFormData({ ...formData, originalInvoice: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="INV-2025-001"
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
                    placeholder="سبب الإرجاع أو الخصم"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t">
                <button onClick={() => setShowCreateModal(false)} className="px-6 py-2 border rounded-lg">إلغاء</button>
                <button onClick={handleCreate} className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
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
