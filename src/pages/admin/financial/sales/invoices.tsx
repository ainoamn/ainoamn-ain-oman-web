// src/pages/admin/financial/sales/invoices.tsx - فواتير البيع الاحترافية المتكاملة
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  FiShoppingCart, FiPlus, FiEye, FiEdit, FiTrash2,FiSearch, FiFilter, FiX, FiSave, FiArrowLeft,
  FiPercent, FiCalendar, FiFileText, FiCheckCircle
} from 'react-icons/fi';
import DocumentActions from '@/components/financial/DocumentActions';
import { AccountingTerm } from '@/components/common/SmartTooltip';

interface InvoiceItem {
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

interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  customer: { id: string; name: string; email?: string; phone?: string; taxId?: string };
  currency: 'OMR' | 'USD' | 'EUR' | 'SAR' | 'AED';
  date: string;
  dueDate: string;
  purchaseOrder?: string;
  reference?: string;
  project?: string;
  warehouse?: string;
  paymentTerms: number;
  items: InvoiceItem[];
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  total: number;
  amountPaid: number;
  balance: number;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  notes?: string;
  terms?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function SalesInvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const [formData, setFormData] = useState<Partial<SalesInvoice>>({
    invoiceNumber: '',
    customer: { id: '', name: '' },
    currency: 'OMR',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentTerms: 30,
    items: [],
    subtotal: 0,
    totalDiscount: 0,
    totalTax: 0,
    total: 0,
    amountPaid: 0,
    balance: 0,
    status: 'draft'
  });

  const [currentItem, setCurrentItem] = useState<Partial<InvoiceItem>>({
    description: '',
    account: '',
    quantity: 1,
    unitPrice: 0,
    discountPercent: 0,
    taxRate: 0
  });

  useEffect(() => {
    loadInvoices();
    loadNextInvoiceNumber();
  }, []);

  const loadInvoices = () => {
    const mockInvoices: any[] = []; // تم إزالة البيانات الوهمية // تم إزالة البيانات الوهمية - يتم الجلب من API
    setInvoices([]); // تم استبدال mockInvoices ببيانات فارغة
  };

  const loadNextInvoiceNumber = async () => {
    try {
      const response = await fetch('/api/financial/next-invoice-number');
      const data = await response.json();
      setFormData(prev => ({ ...prev, invoiceNumber: data.invoiceNumber }));
    } catch (error) {
      const year = new Date().getFullYear();
      const nextNum = invoices.length + 1;
      setFormData(prev => ({ ...prev, invoiceNumber: `INV-${year}-${String(nextNum).padStart(3, '0')}` }));
    }
  };

  const calculateItemTotals = (item: Partial<InvoiceItem>) => {
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

    const newItem: InvoiceItem = {
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
    const balance = total - (formData.amountPaid || 0);

    setFormData({
      ...formData,
      items: updatedItems,
      subtotal,
      totalDiscount,
      totalTax,
      total,
      balance
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
    const balance = total - (formData.amountPaid || 0);

    setFormData({
      ...formData,
      items: updatedItems,
      subtotal,
      totalDiscount,
      totalTax,
      total,
      balance
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

    const newInvoice: SalesInvoice = {
      ...(formData as SalesInvoice),
      id: Date.now().toString(),
      createdBy: 'current_user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setInvoices([...invoices, newInvoice]);
    setShowCreateModal(false);
    alert('تم حفظ الفاتورة بنجاح!');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      viewed: 'bg-indigo-100 text-indigo-800',
      paid: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      draft: 'مسودة',
      sent: 'مرسلة',
      viewed: 'تم عرضها',
      paid: 'مدفوعة',
      partial: 'مدفوعة جزئياً',
      overdue: 'متأخرة',
      cancelled: 'ملغاة'
    };
    return texts[status] || status;
  };

  const stats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'draft').length,
    sent: invoices.filter(i => i.status === 'sent').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    totalAmount: invoices.reduce((sum, i) => sum + i.total, 0),
    totalPaid: invoices.reduce((sum, i) => sum + i.amountPaid, 0),
    totalOutstanding: invoices.reduce((sum, i) => sum + i.balance, 0)
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-8">
      <Head><title>فواتير البيع - النظام المالي المتقدم</title></Head>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/financial/sales')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all"
          >
            <FiArrowLeft />
            العودة إلى المبيعات
          </button>

          <div className="flex items-center justify-between">
            <div>
              <AccountingTerm termKey="accounts_receivable">
                <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                  <FiShoppingCart className="text-green-600" />
                  فواتير البيع
                </h1>
              </AccountingTerm>
              <p className="text-gray-600 mt-2">إدارة فواتير المبيعات بأعلى المعايير المحاسبية</p>
            </div>
            <button
              onClick={() => {
                loadNextInvoiceNumber();
                setShowCreateModal(true);
              }}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center gap-2 shadow-xl transform hover:scale-105 transition-all"
            >
              <FiPlus className="w-5 h-5" />
              <span className="font-bold">فاتورة بيع جديدة</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center border-r-4 border-gray-400">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-600">الإجمالي</p>
          </div>
          <div className="bg-gray-50 rounded-xl shadow-sm p-4 text-center border-r-4 border-gray-500">
            <p className="text-2xl font-bold text-gray-700">{stats.draft}</p>
            <p className="text-xs text-gray-600">مسودات</p>
          </div>
          <div className="bg-blue-50 rounded-xl shadow-sm p-4 text-center border-r-4 border-blue-500">
            <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
            <p className="text-xs text-blue-700">مرسلة</p>
          </div>
          <div className="bg-green-50 rounded-xl shadow-sm p-4 text-center border-r-4 border-green-500">
            <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
            <p className="text-xs text-green-700">مدفوعة</p>
          </div>
          <div className="bg-red-50 rounded-xl shadow-sm p-4 text-center border-r-4 border-red-500">
            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            <p className="text-xs text-red-700">متأخرة</p>
          </div>
          <div className="bg-purple-50 rounded-xl shadow-sm p-4 text-center border-r-4 border-purple-500">
            <p className="text-lg font-bold text-purple-600">{stats.totalAmount.toFixed(0)}</p>
            <p className="text-xs text-purple-700">إجمالي المبالغ</p>
          </div>
          <div className="bg-teal-50 rounded-xl shadow-sm p-4 text-center border-r-4 border-teal-500">
            <p className="text-lg font-bold text-teal-600">{stats.totalPaid.toFixed(0)}</p>
            <p className="text-xs text-teal-700">المدفوع</p>
          </div>
          <div className="bg-orange-50 rounded-xl shadow-sm p-4 text-center border-r-4 border-orange-500">
            <p className="text-lg font-bold text-orange-600">{stats.totalOutstanding.toFixed(0)}</p>
            <p className="text-xs text-orange-700">المتبقي</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative md:col-span-2">
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="بحث برقم الفاتورة، اسم العميل، أو المرجع..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">جميع الحالات</option>
              <option value="draft">مسودة</option>
              <option value="sent">مرسلة</option>
              <option value="paid">مدفوعة</option>
              <option value="overdue">متأخرة</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium">
              <FiFilter />
              فلتر متقدم
            </button>
            <button className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-medium">
              <FiFileText />
              تصدير Excel
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold">رقم الفاتورة</th>
                  <th className="px-6 py-4 text-right text-sm font-bold">العميل</th>
                  <th className="px-6 py-4 text-right text-sm font-bold">التاريخ</th>
                  <th className="px-6 py-4 text-right text-sm font-bold">الاستحقاق</th>
                  <th className="px-6 py-4 text-right text-sm font-bold">المبلغ</th>
                  <th className="px-6 py-4 text-right text-sm font-bold">المدفوع</th>
                  <th className="px-6 py-4 text-right text-sm font-bold">المتبقي</th>
                  <th className="px-6 py-4 text-right text-sm font-bold">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-bold">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-green-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-green-600">{invoice.invoiceNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{invoice.customer.name}</div>
                      {invoice.customer.email && (
                        <div className="text-xs text-gray-500">{invoice.customer.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{new Date(invoice.date).toLocaleDateString('ar-OM')}</td>
                    <td className="px-6 py-4 text-gray-600">{new Date(invoice.dueDate).toLocaleDateString('ar-OM')}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{invoice.total.toFixed(3)} {invoice.currency}</div>
                      {invoice.totalDiscount > 0 && (
                        <div className="text-xs text-green-600">خصم: {invoice.totalDiscount.toFixed(3)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-green-600 font-bold">{invoice.amountPaid.toFixed(3)}</td>
                    <td className="px-6 py-4 text-orange-600 font-bold">{invoice.balance.toFixed(3)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-100 rounded-lg transition-all"
                          title="عرض"
                        >
                          <FiEye className="w-5 h-5" />
                        </button>
                        <DocumentActions
                          documentType="sales-invoice"
                          documentId={invoice.id}
                          documentNumber={invoice.invoiceNumber}
                          documentTitle={`فاتورة بيع - ${invoice.customer.name}`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Invoice Modal */}
        {showCreateModal && (
          <CreateInvoiceModal
            formData={formData}
            setFormData={setFormData}
            currentItem={currentItem}
            setCurrentItem={setCurrentItem}
            handleItemChange={handleItemChange}
            addItem={addItem}
            removeItem={removeItem}
            handleSave={handleSave}
            onClose={() => setShowCreateModal(false)}
          />
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedInvoice && (
          <InvoiceDetailsModal
            invoice={selectedInvoice}
            onClose={() => setShowDetailsModal(false)}
          />
        )}

      </div>
    </div>
  );
}

// ============================================
// Create Invoice Modal Component
// ============================================
function CreateInvoiceModal({
  formData,
  setFormData,
  currentItem,
  setCurrentItem,
  handleItemChange,
  addItem,
  removeItem,
  handleSave,
  onClose
}: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full my-8">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">فاتورة بيع جديدة</h2>
              <p className="text-green-100 text-sm mt-1">إنشاء فاتورة بيع احترافية متوافقة مع IFRS 15</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* معلومات الفاتورة */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b-2 border-green-200">
              <FiFileText className="text-green-600" />
              معلومات الفاتورة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2 text-gray-700">العميل *</label>
                <select
                  value={formData.customer?.id}
                  onChange={(e) => {
                    const opt = e.target.options[e.target.selectedIndex];
                    setFormData({
                      ...formData,
                      customer: {
                        id: e.target.value,
                        name: opt.text,
                        email: opt.getAttribute('data-email') || undefined,
                        phone: opt.getAttribute('data-phone') || undefined,
                        taxId: opt.getAttribute('data-tax') || undefined
                      }
                    });
                  }}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">اختر العميل...</option>
                  <option value="CUST-001" data-email="ahmed@example.com" data-phone="+96891234567" data-tax="TAX-123">
                    أحمد السالمي
                  </option>
                  <option value="CUST-002" data-email="fatima@example.com" data-phone="+96891234568" data-tax="TAX-456">
                    فاطمة الشنفري
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">رقم الفاتورة *</label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  readOnly
                  className="w-full px-4 py-3 border-2 rounded-xl bg-green-50 font-mono font-bold text-green-700 border-green-300"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">العملة *</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500"
                >
                  <option value="OMR">OMR ر.ع.</option>
                  <option value="USD">USD $</option>
                  <option value="EUR">EUR €</option>
                  <option value="SAR">SAR ر.س</option>
                  <option value="AED">AED د.إ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">التاريخ *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">تاريخ الاستحقاق *</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">شروط الدفع (أيام)</label>
                <input
                  type="number"
                  value={formData.paymentTerms}
                  onChange={(e) => {
                    const days = parseInt(e.target.value) || 30;
                    const dueDate = new Date(formData.date || new Date());
                    dueDate.setDate(dueDate.getDate() + days);
                    setFormData({
                      ...formData,
                      paymentTerms: days,
                      dueDate: dueDate.toISOString().split('T')[0]
                    });
                  }}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">أمر الشراء</label>
                <input
                  type="text"
                  value={formData.purchaseOrder || ''}
                  onChange={(e) => setFormData({ ...formData, purchaseOrder: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500"
                  placeholder="اختياري"
                />
              </div>
            </div>
          </div>

          {/* البنود */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b-2 border-green-200">
              <FiShoppingCart className="text-green-600" />
              بنود الفاتورة
            </h3>
            
            {/* إضافة بند */}
            <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 p-6 rounded-2xl mb-4 border-2 border-green-200 shadow-inner">
              <div className="grid grid-cols-1 md:grid-cols-9 gap-3 mb-3">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="وصف البند *"
                    value={currentItem.description}
                    onChange={(e) => handleItemChange('description', e.target.value)}
                    className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <select
                    value={currentItem.account}
                    onChange={(e) => handleItemChange('account', e.target.value)}
                    className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">الحساب *</option>
                    <option value="4100">إيرادات المبيعات</option>
                    <option value="4200">إيرادات الخدمات</option>
                    <option value="4300">إيرادات الإيجارات</option>
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="الكمية *"
                    value={currentItem.quantity}
                    onChange={(e) => handleItemChange('quantity', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-green-500 text-center font-bold"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="السعر *"
                    value={currentItem.unitPrice}
                    onChange={(e) => handleItemChange('unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-green-500 text-center font-bold"
                    step="0.001"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="خصم %"
                    value={currentItem.discountPercent}
                    onChange={(e) => handleItemChange('discountPercent', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-green-500 text-center"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="ضريبة %"
                    value={currentItem.taxRate}
                    onChange={(e) => handleItemChange('taxRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-green-500 text-center"
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="font-bold text-center py-2 bg-white rounded-xl border-4 border-green-400 text-green-700 text-lg">
                    {(currentItem.total || 0).toFixed(3)}
                  </div>
                </div>
              </div>
              <button
                onClick={addItem}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 w-full md:w-auto flex items-center justify-center gap-2 font-bold shadow-lg transform hover:scale-105 transition-all"
              >
                <FiPlus className="w-5 h-5" />
                إضافة بند
              </button>
            </div>

            {/* قائمة البنود */}
            {formData.items && formData.items.length > 0 && (
              <div className="border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">الوصف</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">الكمية</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">السعر</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">خصم</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">ضريبة</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">المجموع</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-gray-100">
                    {formData.items.map((item: InvoiceItem) => (
                      <tr key={item.id} className="hover:bg-green-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{item.description}</td>
                        <td className="px-4 py-3 text-center font-bold">{item.quantity}</td>
                        <td className="px-4 py-3 text-center">{item.unitPrice.toFixed(3)}</td>
                        <td className="px-4 py-3 text-center text-green-600">
                          {item.discountPercent > 0 && (
                            <div>
                              <div className="font-bold">{item.discountPercent}%</div>
                              <div className="text-xs">-{item.discountAmount.toFixed(3)}</div>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.taxRate > 0 && (
                            <div>
                              <div className="font-bold">{item.taxRate}%</div>
                              <div className="text-xs">+{item.taxAmount.toFixed(3)}</div>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-bold text-lg text-gray-900">{item.total.toFixed(3)}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-900 hover:bg-red-100 p-2 rounded-lg transition-all"
                          >
                            <FiTrash2 className="w-5 h-5" />
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
          <div className="bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl p-6 border-2 border-green-200">
            <div className="max-w-lg ml-auto space-y-4">
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-700 font-medium">المجموع الفرعي:</span>
                <span className="font-bold text-gray-900">{(formData.subtotal || 0).toFixed(3)} {formData.currency}</span>
              </div>
              
              {formData.totalDiscount! > 0 && (
                <div className="flex justify-between items-center text-lg bg-green-100 px-4 py-2 rounded-xl">
                  <span className="text-green-700 font-medium flex items-center gap-2">
                    <FiPercent className="w-5 h-5" />
                    إجمالي الخصم:
                  </span>
                  <span className="font-bold text-green-700">(-{(formData.totalDiscount || 0).toFixed(3)})</span>
                </div>
              )}
              
              {formData.totalTax! > 0 && (
                <div className="flex justify-between items-center text-lg">
                  <span className="text-gray-700 font-medium">الضريبة:</span>
                  <span className="font-bold text-gray-900">{(formData.totalTax || 0).toFixed(3)} {formData.currency}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center text-2xl border-t-4 border-green-400 pt-4 bg-white px-4 py-3 rounded-xl shadow-md">
                <span className="font-bold text-gray-900">الإجمالي:</span>
                <span className="font-bold text-green-600">{(formData.total || 0).toFixed(3)} {formData.currency}</span>
              </div>
            </div>
          </div>

          {/* ملاحظات وشروط */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">الشروط والأحكام</label>
              <textarea
                value={formData.terms || ''}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500"
                rows={4}
                placeholder="شروط الدفع والتسليم..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">ملاحظات داخلية</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500"
                rows={4}
                placeholder="ملاحظات للاستخدام الداخلي..."
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-100 to-green-100 p-6 flex justify-between items-center border-t-2 border-green-300 sticky bottom-0">
          <div className="text-sm text-gray-700 bg-white px-4 py-2 rounded-xl shadow">
            <FiCheckCircle className="inline ml-1 text-green-600 w-5 h-5" />
            رقم الفاتورة: <strong className="font-mono text-green-700">{formData.invoiceNumber}</strong>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-8 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-200 font-bold transition-all"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center gap-2 font-bold shadow-lg transform hover:scale-105 transition-all"
            >
              <FiSave className="w-5 h-5" />
              حفظ الفاتورة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Invoice Details Modal Component
// ============================================
function InvoiceDetailsModal({ invoice, onClose }: { invoice: SalesInvoice; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
          <h2 className="text-2xl font-bold">فاتورة بيع - {invoice.invoiceNumber}</h2>
          <p className="text-green-100 text-sm mt-1">{invoice.customer.name}</p>
        </div>

        <div className="p-8 space-y-6">
          {/* معلومات العميل */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
            <h3 className="font-bold text-green-900 mb-4 text-lg">معلومات العميل</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-green-700">الاسم:</p>
                <p className="font-bold text-gray-900">{invoice.customer.name}</p>
              </div>
              {invoice.customer.email && (
                <div>
                  <p className="text-sm text-green-700">البريد:</p>
                  <p className="font-bold text-gray-900">{invoice.customer.email}</p>
                </div>
              )}
              {invoice.customer.phone && (
                <div>
                  <p className="text-sm text-green-700">الهاتف:</p>
                  <p className="font-bold text-gray-900">{invoice.customer.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* البنود */}
          {invoice.items && invoice.items.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">البنود</h3>
              <div className="border-2 rounded-xl overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">الوصف</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">الكمية</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">السعر</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">المجموع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {invoice.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">{item.description}</td>
                        <td className="px-4 py-3 text-center font-bold">{item.quantity}</td>
                        <td className="px-4 py-3 text-center">{item.unitPrice.toFixed(3)}</td>
                        <td className="px-4 py-3 font-bold text-lg">{item.total.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* المجاميع */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="max-w-md ml-auto space-y-3">
              <div className="flex justify-between text-lg">
                <span className="text-gray-600">المجموع الفرعي:</span>
                <span className="font-bold">{invoice.subtotal.toFixed(3)} {invoice.currency}</span>
              </div>
              {invoice.totalDiscount > 0 && (
                <div className="flex justify-between text-lg text-green-600">
                  <span>الخصم:</span>
                  <span className="font-bold">(-{invoice.totalDiscount.toFixed(3)})</span>
                </div>
              )}
              {invoice.totalTax > 0 && (
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">الضريبة:</span>
                  <span className="font-bold">{invoice.totalTax.toFixed(3)} {invoice.currency}</span>
                </div>
              )}
              <div className="flex justify-between text-2xl border-t-2 pt-3 border-green-400">
                <span className="font-bold text-gray-900">الإجمالي:</span>
                <span className="font-bold text-green-600">{invoice.total.toFixed(3)} {invoice.currency}</span>
              </div>
              <div className="flex justify-between text-lg border-t pt-2">
                <span className="text-gray-600">المدفوع:</span>
                <span className="font-bold text-blue-600">{invoice.amountPaid.toFixed(3)}</span>
              </div>
              <div className="flex justify-between text-xl">
                <span className="text-gray-700 font-bold">المتبقي:</span>
                <span className="font-bold text-orange-600">{invoice.balance.toFixed(3)} {invoice.currency}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 flex justify-between items-center border-t-2">
          <DocumentActions
            documentType="sales-invoice"
            documentId={invoice.id}
            documentNumber={invoice.invoiceNumber}
            documentTitle={`فاتورة بيع - ${invoice.customer.name}`}
          />
          <button
            onClick={onClose}
            className="px-8 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-200 font-bold"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
