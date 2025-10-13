// src/pages/admin/financial/sales/receipts.tsx - سندات العملاء (سندات القبض)
import React, { useState } from 'react';
import Head from 'next/head';
import { FiDollarSign, FiPlus, FiEye, FiPrinter, FiX, FiSave } from 'react-icons/fi';

interface Receipt {
  id: string;
  receiptNumber: string;
  customer: string;
  amount: number;
  paymentMethod: string;
  date: string;
  reference?: string;
  notes?: string;
}

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([
    {
      id: '1',
      receiptNumber: 'RCP-2025-001',
      customer: 'أحمد السالمي',
      amount: 0 // تم تصفير من 1500,
      paymentMethod: 'نقدي',
      date: '2025-10-10'
    }
  ]);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    amount: 0,
    paymentMethod: 'cash',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    notes: ''
  });

  const handleCreate = () => {
    if (!formData.customer || formData.amount <= 0) {
      alert('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    const newReceipt: Receipt = {
      id: Date.now().toString(),
      receiptNumber: `RCP-2025-${String(receipts.length + 1).padStart(3, '0')}`,
      customer: formData.customer,
      amount: formData.amount,
      paymentMethod: formData.paymentMethod === 'cash' ? 'نقدي' : 'بنكي',
      date: formData.date,
      reference: formData.reference,
      notes: formData.notes
    };

    setReceipts([...receipts, newReceipt]);
    setShowCreateModal(false);
    alert('تم إضافة سند القبض بنجاح!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>سندات العملاء - المبيعات</title></Head>
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FiDollarSign className="text-purple-600" />
              سندات العملاء (سندات القبض)
            </h1>
            <p className="text-gray-600 mt-2">سندات القبض النقدية من العملاء</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
          >
            <FiPlus />
            سند قبض جديد
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">الرقم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">العميل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">المبلغ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">الطريقة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((receipt) => (
                <tr key={receipt.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{receipt.receiptNumber}</td>
                  <td className="px-6 py-4">{receipt.customer}</td>
                  <td className="px-6 py-4 font-bold text-green-600">{receipt.amount.toLocaleString()} ر.ع</td>
                  <td className="px-6 py-4">{receipt.paymentMethod}</td>
                  <td className="px-6 py-4">{receipt.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-900 p-1"><FiEye className="w-4 h-4" /></button>
                      <button className="text-green-600 hover:text-green-900 p-1"><FiPrinter className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full">
              <div className="bg-purple-600 p-6 text-white flex items-center justify-between">
                <h2 className="text-2xl font-bold">سند قبض جديد</h2>
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
                    <option value="فاطمة الشنفري">فاطمة الشنفري</option>
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

                <div>
                  <label className="block text-sm font-medium mb-2">التاريخ</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">ملاحظات</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t">
                <button onClick={() => setShowCreateModal(false)} className="px-6 py-2 border rounded-lg">إلغاء</button>
                <button onClick={handleCreate} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
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
