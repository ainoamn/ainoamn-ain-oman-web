// src/pages/admin/financial/sales/recurring.tsx - فواتير مجدولة (متكررة)
import React, { useState } from 'react';
import Head from 'next/head';
import { FiRefreshCw, FiPlus, FiEye, FiX, FiSave } from 'react-icons/fi';

interface RecurringInvoice {
  id: string;
  templateName: string;
  customer: string;
  amount: number;
  frequency: string;
  nextDate: string;
  isActive: boolean;
}

export default function RecurringInvoicesPage() {
  const [invoices, setInvoices] = useState<RecurringInvoice[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    templateName: '',
    customer: '',
    amount: 0,
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    isActive: true
  });

  const handleCreate = () => {
    if (!formData.templateName || !formData.customer || formData.amount <= 0) {
      alert('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    const newInvoice: RecurringInvoice = {
      id: Date.now().toString(),
      templateName: formData.templateName,
      customer: formData.customer,
      amount: formData.amount,
      frequency: formData.frequency === 'monthly' ? 'شهرياً' : 'سنوياً',
      nextDate: formData.startDate,
      isActive: formData.isActive
    };

    setInvoices([...invoices, newInvoice]);
    setShowCreateModal(false);
    alert('تم إضافة الفاتورة المجدولة بنجاح!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>فواتير مجدولة - المبيعات</title></Head>
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FiRefreshCw className="text-indigo-600" />
              فواتير مجدولة (متكررة)
            </h1>
            <p className="text-gray-600 mt-2">فواتير تصدر تلقائياً حسب الجدول</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
          >
            <FiPlus />
            فاتورة مجدولة جديدة
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <FiRefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">لا توجد فواتير مجدولة حالياً</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                إضافة أول فاتورة مجدولة
              </button>
            </div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">القالب</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">العميل</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">المبلغ</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">التكرار</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">التاريخ القادم</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{inv.templateName}</td>
                    <td className="px-4 py-3">{inv.customer}</td>
                    <td className="px-4 py-3 font-bold">{inv.amount.toLocaleString()} ر.ع</td>
                    <td className="px-4 py-3">{inv.frequency}</td>
                    <td className="px-4 py-3">{inv.nextDate}</td>
                    <td className="px-4 py-3">
                      <button className="text-blue-600 hover:text-blue-900 p-1"><FiEye className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full">
              <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
                <h2 className="text-2xl font-bold">فاتورة مجدولة جديدة</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-white p-2 rounded hover:bg-white hover:bg-opacity-20">
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">اسم القالب *</label>
                  <input
                    type="text"
                    value={formData.templateName}
                    onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="فاتورة إيجار شهري"
                  />
                </div>

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
                    <label className="block text-sm font-medium mb-2">التكرار</label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="monthly">شهرياً</option>
                      <option value="quarterly">ربع سنوي</option>
                      <option value="annually">سنوياً</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">تاريخ البداية</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t">
                <button onClick={() => setShowCreateModal(false)} className="px-6 py-2 border rounded-lg">إلغاء</button>
                <button onClick={handleCreate} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
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
