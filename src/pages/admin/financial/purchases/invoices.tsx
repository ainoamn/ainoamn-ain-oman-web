// src/pages/admin/financial/purchases/invoices.tsx - فواتير المشتريات المتقدمة
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  FiShoppingBag, FiPlus, FiEye, FiEdit, FiTrash2, FiPrinter,
  FiDownload, FiSearch, FiX
} from 'react-icons/fi';

interface PurchaseItem {
  id: string;
  description: string;
  account: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  vendor: { id: string; name: string };
  currency: 'OMR' | 'USD' | 'EUR' | 'SAR' | 'AED';
  date: string;
  dueDate: string;
  reference?: string;
  project?: string;
  warehouse?: string;
  taxRegistration?: string;
  country: string;
  items: PurchaseItem[];
  subtotal: number;
  totalTax: number;
  total: number;
  amountPaid: number;
  balance: number;
  status: 'draft' | 'received' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export default function PurchaseInvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const [formData, setFormData] = useState<Partial<PurchaseInvoice>>({
    invoiceNumber: '',
    vendor: { id: '', name: '' },
    currency: 'OMR',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    country: 'عُمان',
    items: [],
    subtotal: 0,
    totalTax: 0,
    total: 0,
    amountPaid: 0,
    balance: 0,
    status: 'draft'
  });

  const [currentItem, setCurrentItem] = useState<Partial<PurchaseItem>>({
    description: '',
    account: '',
    quantity: 1,
    unitPrice: 0,
    taxRate: 0
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    const mockInvoices: any[] = []; // تم إزالة البيانات الوهمية - يتم الجلب من API
    setInvoices(mockInvoices);
  };

  const calculateItemTotals = (item: Partial<PurchaseItem>) => {
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    const taxRate = item.taxRate || 0;

    const subtotal = quantity * unitPrice;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    return { ...item, subtotal, taxAmount, total };
  };

  const handleItemChange = (field: string, value: any) => {
    const updated = { ...currentItem, [field]: value };
    const calculated = calculateItemTotals(updated);
    setCurrentItem(calculated);
  };

  const addItem = () => {
    if (!currentItem.description || !currentItem.account) {
      alert('الرجاء ملء الوصف والحساب');
      return;
    }

    const newItem: PurchaseItem = {
      id: Date.now().toString(),
      description: currentItem.description || '',
      account: currentItem.account || '',
      quantity: currentItem.quantity || 1,
      unitPrice: currentItem.unitPrice || 0,
      subtotal: currentItem.subtotal || 0,
      taxRate: currentItem.taxRate || 0,
      taxAmount: currentItem.taxAmount || 0,
      total: currentItem.total || 0
    };

    const updatedItems = [...(formData.items || []), newItem];
    const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const totalTax = updatedItems.reduce((sum, item) => sum + item.taxAmount, 0);
    const total = subtotal + totalTax;
    const balance = total - (formData.amountPaid || 0);

    setFormData({
      ...formData,
      items: updatedItems,
      subtotal,
      totalTax,
      total,
      balance
    });

    setCurrentItem({
      description: '',
      account: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0
    });
  };

  const removeItem = (itemId: string) => {
    const updatedItems = formData.items?.filter(item => item.id !== itemId) || [];
    const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const totalTax = updatedItems.reduce((sum, item) => sum + item.taxAmount, 0);
    const total = subtotal + totalTax;
    const balance = total - (formData.amountPaid || 0);

    setFormData({
      ...formData,
      items: updatedItems,
      subtotal,
      totalTax,
      total,
      balance
    });
  };

  const handleSave = () => {
    if (!formData.vendor?.id) {
      alert('الرجاء اختيار المورد');
      return;
    }

    if (!formData.items || formData.items.length === 0) {
      alert('الرجاء إضافة بند واحد على الأقل');
      return;
    }

    console.log('حفظ فاتورة المشتريات:', formData);
    alert('تم حفظ الفاتورة بنجاح!');
    setShowCreateModal(false);
    loadInvoices();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      received: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      draft: 'مسودة',
      received: 'مستلمة',
      paid: 'مدفوعة',
      overdue: 'متأخرة',
      cancelled: 'ملغاة'
    };
    return texts[status] || status;
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.vendor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>فواتير المشتريات - النظام المالي</title></Head>

      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FiShoppingBag className="text-blue-600" />
              فواتير المشتريات
            </h1>
            <p className="text-gray-600 mt-2">إدارة فواتير المشتريات من الموردين</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg"
          >
            <FiPlus />
            فاتورة مشتريات جديدة
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border rounded-lg"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">جميع الحالات</option>
              <option value="draft">مسودة</option>
              <option value="received">مستلمة</option>
              <option value="paid">مدفوعة</option>
              <option value="overdue">متأخرة</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <FiDownload />
              تصدير
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">رقم الفاتورة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">المورد</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">المبلغ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">المدفوع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">المتبقي</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{invoice.invoiceNumber}</td>
                  <td className="px-6 py-4">{invoice.vendor.name}</td>
                  <td className="px-6 py-4">{invoice.date}</td>
                  <td className="px-6 py-4 font-bold">{invoice.total.toLocaleString()} {invoice.currency}</td>
                  <td className="px-6 py-4 text-green-600">{invoice.amountPaid.toLocaleString()}</td>
                  <td className="px-6 py-4 text-orange-600">{invoice.balance.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                      {getStatusText(invoice.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-900 p-1">
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button className="text-indigo-600 hover:text-indigo-900 p-1">
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900 p-1">
                        <FiPrinter className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full my-8">
              <div className="bg-blue-600 p-6 text-white flex items-center justify-between">
                <h2 className="text-2xl font-bold">فاتورة مشتريات جديدة</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded">
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* معلومات الفاتورة */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">المورد *</label>
                    <select
                      value={formData.vendor?.id}
                      onChange={(e) => setFormData({ ...formData, vendor: { id: e.target.value, name: e.target.options[e.target.selectedIndex].text } })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    >
                      <option value="">اختر المورد...</option>
                      <option value="VEND-001">شركة التوريدات</option>
                      <option value="VEND-002">مؤسسة الإمدادات</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">رقم الفاتورة *</label>
                    <input
                      type="text"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                      placeholder="PUR-2025-000001"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">العملة *</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="OMR">OMR ر.ع.</option>
                      <option value="USD">USD $</option>
                      <option value="EUR">EUR €</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">التاريخ *</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">تاريخ الاستحقاق *</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">المرجع (اختياري)</label>
                    <input
                      type="text"
                      value={formData.reference || ''}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                {/* البنود */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold mb-4">بنود الفاتورة</h3>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          placeholder="الوصف *"
                          value={currentItem.description}
                          onChange={(e) => handleItemChange('description', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <select
                          value={currentItem.account}
                          onChange={(e) => handleItemChange('account', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="">الحساب *</option>
                          <option value="5100">مصروفات المشتريات</option>
                          <option value="5200">مصروفات التشغيل</option>
                        </select>
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="الكمية *"
                          value={currentItem.quantity}
                          onChange={(e) => handleItemChange('quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="السعر *"
                          value={currentItem.unitPrice}
                          onChange={(e) => handleItemChange('unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-center py-2">
                          {(currentItem.total || 0).toFixed(3)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={addItem}
                      className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full md:w-auto"
                    >
                      <FiPlus className="inline ml-2" />
                      إضافة بند
                    </button>
                  </div>

                  {formData.items && formData.items.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-right text-xs">الوصف</th>
                            <th className="px-4 py-2 text-right text-xs">الكمية</th>
                            <th className="px-4 py-2 text-right text-xs">السعر</th>
                            <th className="px-4 py-2 text-right text-xs">المجموع</th>
                            <th className="px-4 py-2 text-right text-xs"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {formData.items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-2">{item.description}</td>
                              <td className="px-4 py-2">{item.quantity}</td>
                              <td className="px-4 py-2">{item.unitPrice.toFixed(3)}</td>
                              <td className="px-4 py-2 font-bold">{item.total.toFixed(3)}</td>
                              <td className="px-4 py-2">
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* المجاميع */}
                <div className="border-t pt-6">
                  <div className="max-w-md ml-auto space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">المجموع الفرعي:</span>
                      <span className="font-bold">{(formData.subtotal || 0).toFixed(3)} {formData.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الضريبة:</span>
                      <span className="font-bold">{(formData.totalTax || 0).toFixed(3)} {formData.currency}</span>
                    </div>
                    <div className="flex justify-between text-lg border-t pt-2">
                      <span className="font-bold">الإجمالي:</span>
                      <span className="font-bold text-blue-600">{(formData.total || 0).toFixed(3)} {formData.currency}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-100"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  حفظ الفاتورة
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
