// src/pages/admin/financial/sales/quotations.tsx - عروض الأسعار الاحترافية المتكاملة
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  FiFileText, FiPlus, FiEye, FiEdit, FiSend, FiCheckCircle, FiX,
  FiTrash2, FiSearch, FiFilter, FiDownload, FiArrowLeft, FiSave,
  FiPercent, FiDollarSign, FiCalendar
} from 'react-icons/fi';
import DocumentActions from '@/components/financial/DocumentActions';
import { AccountingTerm } from '@/components/common/SmartTooltip';
import { GRADIENTS, getButtonClass, getStatusColor, getStatusText } from '@/lib/theme-colors';

interface QuotationItem {
  id: string;
  description: string;
  account: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

interface Quotation {
  id: string;
  quotationNumber: string;
  customer: { id: string; name: string; email?: string; phone?: string };
  date: string;
  validUntil: string;
  reference?: string;
  project?: string;
  terms?: string;
  currency: 'OMR' | 'USD' | 'EUR';
  items: QuotationItem[];
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  total: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'converted';
  notes?: string;
  createdAt: string;
}

export default function QuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [formData, setFormData] = useState<Partial<Quotation>>({
    quotationNumber: '',
    customer: { id: '', name: '' },
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: 'OMR',
    items: [],
    subtotal: 0,
    totalDiscount: 0,
    totalTax: 0,
    total: 0,
    status: 'pending'
  });

  const [currentItem, setCurrentItem] = useState<Partial<QuotationItem>>({
    description: '',
    account: '',
    quantity: 1,
    unitPrice: 0,
    discountPercent: 0,
    taxRate: 0
  });

  useEffect(() => {
    loadQuotations();
    loadNextQuotationNumber();
  }, []);

  const loadQuotations = () => {
    const mockQuotations: any[] = []; // تم إزالة البيانات الوهمية - يتم الجلب من API
    setQuotations([]); // تم استبدال mockQuotations ببيانات فارغة
  };

  const loadNextQuotationNumber = async () => {
    const year = new Date().getFullYear();
    const nextNum = quotations.length + 1;
    const quotationNumber = `QUO-${year}-${String(nextNum).padStart(3, '0')}`;
    setFormData(prev => ({ ...prev, quotationNumber }));
  };

  const calculateItemTotals = (item: Partial<QuotationItem>) => {
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    const discountPercent = item.discountPercent || 0;
    const taxRate = item.taxRate || 0;

    const subtotal = quantity * unitPrice;
    const discountAmount = subtotal * (discountPercent / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (taxRate / 100);
    const total = afterDiscount + taxAmount;

    return { ...item, subtotal, discountAmount, taxAmount, total };
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

    const newItem: QuotationItem = {
      id: Date.now().toString(),
      description: currentItem.description || '',
      account: currentItem.account || '',
      quantity: currentItem.quantity || 1,
      unitPrice: currentItem.unitPrice || 0,
      discountPercent: currentItem.discountPercent || 0,
      discountAmount: currentItem.discountAmount || 0,
      subtotal: currentItem.subtotal || 0,
      taxRate: currentItem.taxRate || 0,
      taxAmount: currentItem.taxAmount || 0,
      total: currentItem.total || 0
    };

    const updatedItems = [...(formData.items || []), newItem];
    const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const totalDiscount = updatedItems.reduce((sum, item) => sum + item.discountAmount, 0);
    const totalTax = updatedItems.reduce((sum, item) => sum + item.taxAmount, 0);
    const total = updatedItems.reduce((sum, item) => sum + item.total, 0);

    setFormData({
      ...formData,
      items: updatedItems,
      subtotal,
      totalDiscount,
      totalTax,
      total
    });

    setCurrentItem({
      description: '',
      account: '',
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
      taxRate: 0
    });
  };

  const removeItem = (itemId: string) => {
    const updatedItems = formData.items?.filter(item => item.id !== itemId) || [];
    const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const totalDiscount = updatedItems.reduce((sum, item) => sum + item.discountAmount, 0);
    const totalTax = updatedItems.reduce((sum, item) => sum + item.taxAmount, 0);
    const total = updatedItems.reduce((sum, item) => sum + item.total, 0);

    setFormData({
      ...formData,
      items: updatedItems,
      subtotal,
      totalDiscount,
      totalTax,
      total
    });
  };

  const handleSave = () => {
    if (!formData.customer?.id) {
      alert('الرجاء اختيار العميل');
      return;
    }

    if (!formData.items || formData.items.length === 0) {
      alert('الرجاء إضافة بند واحد على الأقل');
      return;
    }

    const newQuotation: Quotation = {
      ...(formData as Quotation),
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    setQuotations([...quotations, newQuotation]);
    setShowCreateModal(false);
    alert('تم حفظ عرض السعر بنجاح!');
  };

  const handleEdit = (quotation: Quotation) => {
    setEditingQuotation(quotation);
    setFormData(quotation);
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    if (!editingQuotation) return;

    const updatedQuotations = quotations.map(q =>
      q.id === editingQuotation.id
        ? { ...formData as Quotation, id: editingQuotation.id, createdAt: editingQuotation.createdAt }
        : q
    );

    setQuotations(updatedQuotations);
    setShowEditModal(false);
    setEditingQuotation(null);
    alert('تم تحديث عرض السعر بنجاح!');
  };

  const handleDelete = (quotationId: string) => {
    if (confirm('هل أنت متأكد من حذف عرض السعر؟')) {
      setQuotations(quotations.filter(q => q.id !== quotationId));
      alert('تم الحذف بنجاح!');
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>عروض الأسعار - نظام المبيعات</title></Head>
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/financial/sales')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
          >
            <FiArrowLeft />
            العودة إلى المبيعات
          </button>

          <div className="flex items-center justify-between">
            <div>
              <AccountingTerm termKey="income_statement">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <FiFileText className="text-blue-600" />
                  عروض الأسعار
                </h1>
              </AccountingTerm>
              <p className="text-gray-600 mt-2">عروض الأسعار والفواتير المبدئية للعملاء</p>
            </div>
            <button
              onClick={() => {
                loadNextQuotationNumber();
                setShowCreateModal(true);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg transform hover:scale-105 transition-all"
            >
              <FiPlus />
              عرض سعر جديد
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{quotations.length}</p>
            <p className="text-xs text-gray-600">الإجمالي</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-sm p-4 text-center border border-yellow-200">
            <p className="text-2xl font-bold text-yellow-600">{quotations.filter(q => q.status === 'pending').length}</p>
            <p className="text-xs text-yellow-700">قيد الانتظار</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-sm p-4 text-center border border-green-200">
            <p className="text-2xl font-bold text-green-600">{quotations.filter(q => q.status === 'accepted').length}</p>
            <p className="text-xs text-green-700">مقبولة</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-sm p-4 text-center border border-blue-200">
            <p className="text-2xl font-bold text-blue-600">{quotations.filter(q => q.status === 'converted').length}</p>
            <p className="text-xs text-blue-700">محولة لفاتورة</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="بحث برقم العرض أو العميل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="accepted">مقبولة</option>
              <option value="rejected">مرفوضة</option>
              <option value="expired">منتهية</option>
            </select>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
              <FiDownload />
              تصدير Excel
            </button>
            <button
              onClick={loadQuotations}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              تحديث
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700">رقم العرض</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700">العميل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700">صالح حتى</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700">المبلغ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {quotations.map((q) => (
                <tr key={q.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">{q.quotationNumber}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{q.customer.name}</div>
                    {q.customer.email && (
                      <div className="text-xs text-gray-500">{q.customer.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{new Date(q.date).toLocaleDateString('ar-OM')}</td>
                  <td className="px-6 py-4 text-gray-600">{new Date(q.validUntil).toLocaleDateString('ar-OM')}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{q.total.toFixed(3)} {q.currency}</div>
                    {q.totalDiscount > 0 && (
                      <div className="text-xs text-green-600">خصم: {q.totalDiscount.toFixed(3)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(q.status)}`}>
                      {getStatusText(q.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedQuotation(q);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-100 rounded-lg transition-all"
                        title="عرض"
                      >
                        <FiEye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(q)}
                        className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-100 rounded-lg transition-all"
                        title="تعديل"
                      >
                        <FiEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-100 rounded-lg transition-all"
                        title="حذف"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                      <DocumentActions
                        documentType="quotation"
                        documentId={q.id}
                        documentNumber={q.quotationNumber}
                        documentTitle={`عرض سعر - ${q.customer.name}`}
                      />
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
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full my-8">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <h2 className="text-2xl font-bold">عرض سعر جديد</h2>
                <p className="text-blue-100 text-sm mt-1">إنشاء عرض سعر احترافي للعميل</p>
              </div>

              <div className="p-6 space-y-6">
                {/* معلومات العرض */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiFileText className="text-blue-600" />
                    معلومات عرض السعر
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">العميل *</label>
                      <select
                        value={formData.customer?.id}
                        onChange={(e) => {
                          const selectedOption = e.target.options[e.target.selectedIndex];
                          setFormData({
                            ...formData,
                            customer: {
                              id: e.target.value,
                              name: selectedOption.text,
                              email: selectedOption.getAttribute('data-email') || undefined,
                              phone: selectedOption.getAttribute('data-phone') || undefined
                            }
                          });
                        }}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">اختر العميل...</option>
                        <option value="CUST-001" data-email="ahmed@example.com" data-phone="+96891234567">
                          أحمد السالمي
                        </option>
                        <option value="CUST-002" data-email="fatima@example.com" data-phone="+96891234568">
                          فاطمة الشنفري
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">رقم العرض *</label>
                      <input
                        type="text"
                        value={formData.quotationNumber}
                        readOnly
                        className="w-full px-4 py-2 border rounded-lg bg-gray-50 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">العملة *</label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">صالح حتى *</label>
                      <input
                        type="date"
                        value={formData.validUntil}
                        onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">المرجع</label>
                      <input
                        type="text"
                        value={formData.reference || ''}
                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="اختياري"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">المشروع</label>
                      <input
                        type="text"
                        value={formData.project || ''}
                        onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="اختياري"
                      />
                    </div>
                  </div>
                </div>

                {/* البنود */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">البنود</h3>
                  
                  {/* إضافة بند */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl mb-4 border border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-8 gap-3">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          placeholder="الوصف *"
                          value={currentItem.description}
                          onChange={(e) => handleItemChange('description', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <select
                          value={currentItem.account}
                          onChange={(e) => handleItemChange('account', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">الحساب *</option>
                          <option value="4100">إيرادات المبيعات</option>
                          <option value="4200">إيرادات الخدمات</option>
                          <option value="4300">إيرادات أخرى</option>
                        </select>
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="الكمية *"
                          value={currentItem.quantity}
                          onChange={(e) => handleItemChange('quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="السعر *"
                          value={currentItem.unitPrice}
                          onChange={(e) => handleItemChange('unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          step="0.001"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="خصم %"
                          value={currentItem.discountPercent}
                          onChange={(e) => handleItemChange('discountPercent', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="ضريبة %"
                          value={currentItem.taxRate}
                          onChange={(e) => handleItemChange('taxRate', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-center py-2 bg-white rounded-lg border-2 border-blue-300">
                          {(currentItem.total || 0).toFixed(3)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={addItem}
                      className="mt-3 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 w-full md:w-auto flex items-center justify-center gap-2"
                    >
                      <FiPlus />
                      إضافة بند
                    </button>
                  </div>

                  {/* قائمة البنود */}
                  {formData.items && formData.items.length > 0 && (
                    <div className="border rounded-xl overflow-hidden shadow-sm">
                      <table className="min-w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">الوصف</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">الكمية</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">السعر</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">خصم</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">المجموع</th>
                            <th className="px-4 py-2"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {formData.items.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">{item.description}</td>
                              <td className="px-4 py-3">{item.quantity}</td>
                              <td className="px-4 py-3">{item.unitPrice.toFixed(3)}</td>
                              <td className="px-4 py-3 text-green-600">
                                {item.discountPercent > 0 && `${item.discountPercent}% (-${item.discountAmount.toFixed(3)})`}
                              </td>
                              <td className="px-4 py-3 font-bold">{item.total.toFixed(3)}</td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="text-red-600 hover:text-red-900 p-1"
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
                  <div className="max-w-md ml-auto space-y-3 bg-gray-50 p-6 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">المجموع الفرعي:</span>
                      <span className="font-bold text-lg">{(formData.subtotal || 0).toFixed(3)} {formData.currency}</span>
                    </div>
                    {formData.totalDiscount! > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span className="flex items-center gap-1">
                          <FiPercent className="w-4 h-4" />
                          الخصم:
                        </span>
                        <span className="font-bold">(-{(formData.totalDiscount || 0).toFixed(3)})</span>
                      </div>
                    )}
                    {formData.totalTax! > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">الضريبة:</span>
                        <span className="font-bold">{(formData.totalTax || 0).toFixed(3)} {formData.currency}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xl border-t-2 pt-3 border-blue-300">
                      <span className="font-bold text-gray-900">الإجمالي:</span>
                      <span className="font-bold text-blue-600">{(formData.total || 0).toFixed(3)} {formData.currency}</span>
                    </div>
                  </div>
                </div>

                {/* شروط وملاحظات */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">الشروط والأحكام</label>
                    <textarea
                      value={formData.terms || ''}
                      onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="الشروط الخاصة بعرض السعر..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ملاحظات</label>
                    <textarea
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="ملاحظات إضافية..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 flex justify-between items-center border-t">
                <div className="text-sm text-gray-600">
                  <FiCheckCircle className="inline ml-1 text-green-600" />
                  سيتم حفظ عرض السعر برقم: <strong className="font-mono">{formData.quotationNumber}</strong>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <FiSave />
                    حفظ عرض السعر
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingQuotation && (
          <CreateInvoiceModal
            formData={formData}
            setFormData={setFormData}
            currentItem={currentItem}
            setCurrentItem={setCurrentItem}
            handleItemChange={handleItemChange}
            addItem={addItem}
            removeItem={removeItem}
            handleSave={handleUpdate}
            onClose={() => {
              setShowEditModal(false);
              setEditingQuotation(null);
            }}
            isEdit={true}
            title="تعديل عرض السعر"
          />
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedQuotation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <h2 className="text-2xl font-bold">عرض السعر - {selectedQuotation.quotationNumber}</h2>
                <p className="text-blue-100 text-sm mt-1">{selectedQuotation.customer.name}</p>
              </div>

              <div className="p-6 space-y-6">
                {/* معلومات العميل */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="font-bold text-blue-900 mb-3">معلومات العميل</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700">الاسم:</p>
                      <p className="font-bold text-gray-900">{selectedQuotation.customer.name}</p>
                    </div>
                    {selectedQuotation.customer.email && (
                      <div>
                        <p className="text-blue-700">البريد:</p>
                        <p className="font-bold text-gray-900">{selectedQuotation.customer.email}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* البنود */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">البنود</h3>
                  <div className="border rounded-xl overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">الوصف</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">الكمية</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">السعر</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">خصم</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">المجموع</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedQuotation.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3">{item.description}</td>
                            <td className="px-4 py-3">{item.quantity}</td>
                            <td className="px-4 py-3">{item.unitPrice.toFixed(3)}</td>
                            <td className="px-4 py-3 text-green-600">
                              {item.discountPercent > 0 && `${item.discountPercent}%`}
                            </td>
                            <td className="px-4 py-3 font-bold">{item.total.toFixed(3)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* المجاميع */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="max-w-md ml-auto space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">المجموع الفرعي:</span>
                      <span className="font-bold">{selectedQuotation.subtotal.toFixed(3)} {selectedQuotation.currency}</span>
                    </div>
                    {selectedQuotation.totalDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>الخصم:</span>
                        <span className="font-bold">(-{selectedQuotation.totalDiscount.toFixed(3)})</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl border-t-2 pt-3">
                      <span className="font-bold">الإجمالي:</span>
                      <span className="font-bold text-blue-600">{selectedQuotation.total.toFixed(3)} {selectedQuotation.currency}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 flex justify-between items-center border-t">
                <DocumentActions
                  documentType="quotation"
                  documentId={selectedQuotation.id}
                  documentNumber={selectedQuotation.quotationNumber}
                  documentTitle={`عرض سعر - ${selectedQuotation.customer.name}`}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-6 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    إغلاق
                  </button>
                  <button
                    onClick={() => {
                      alert('سيتم تحويل عرض السعر إلى فاتورة');
                      setShowDetailsModal(false);
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    تحويل لفاتورة
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
