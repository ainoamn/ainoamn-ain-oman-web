// src/pages/admin/financial/bank-accounts.tsx - نظام الحسابات البنكية المتقدم
import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  FiCreditCard, FiPlus, FiEye, FiEdit, FiTrendingUp, FiTrendingDown,
  FiDollarSign, FiCheckCircle, FiAlertCircle, FiRefreshCw, FiX, FiSave
} from 'react-icons/fi';
import { BankAccount } from '@/types/contacts';
import { AccountingTerm } from '@/components/common/SmartTooltip';

export default function BankAccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<BankAccount[]>([
    {
      id: 'bank_1',
      accountName: 'الحساب الجاري الرئيسي',
      accountNumber: '0123456789',
      iban: 'OM23 001 0123456789012345',
      bankName: 'بنك مسقط',
      bankCode: '001',
      branchName: 'فرع الخوير',
      swiftCode: 'BMUSOMRX',
      accountType: 'current',
      currency: 'OMR',
      openingBalance: 0, // تم تصفير من 50000
      currentBalance: 0, // تم تصفير من 67850.50
      availableBalance: 0, // تم تصفير من 67850.50
      overdraftLimit: 0,
      accountingAccountId: 'acc_1120',
      isActive: true,
      isPrimary: true,
      openedDate: '2024-01-01',
      lastReconciliationDate: '2025-01-10',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z'
    },
    {
      id: 'bank_2',
      accountName: 'حساب التوفير',
      accountNumber: '9876543210',
      iban: 'OM23 002 9876543210123456',
      bankName: 'البنك الوطني العُماني',
      bankCode: '002',
      swiftCode: 'NBOMOMRX',
      accountType: 'savings',
      currency: 'OMR',
      openingBalance: 0, // تم تصفير من 100000
      currentBalance: 0, // تم تصفير من 125420.75
      availableBalance: 0, // تم تصفير من 125420.75
      overdraftLimit: 0,
      accountingAccountId: 'acc_1120',
      isActive: true,
      isPrimary: false,
      openedDate: '2024-03-01',
      createdAt: '2024-03-01T00:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z'
    }
  ]);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReconciliationModal, setShowReconciliationModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [formData, setFormData] = useState<Partial<BankAccount>>({
    accountName: '',
    accountNumber: '',
    iban: '',
    bankName: '',
    swiftCode: '',
    accountType: 'current',
    currency: 'OMR',
    openingBalance: 0,
    currentBalance: 0,
    availableBalance: 0,
    overdraftLimit: 0,
    isActive: true,
    isPrimary: false
  });

  const stats = {
    total: accounts.length,
    active: accounts.filter(a => a.isActive).length,
    totalBalance: accounts.reduce((sum, a) => sum + a.currentBalance, 0),
    totalAvailable: accounts.reduce((sum, a) => sum + a.availableBalance, 0)
  };

  const handleCreate = () => {
    const newAccount: BankAccount = {
      id: `bank_${Date.now()}`,
      accountName: formData.accountName || '',
      accountNumber: formData.accountNumber || '',
      iban: formData.iban,
      bankName: formData.bankName || '',
      swiftCode: formData.swiftCode,
      accountType: formData.accountType || 'current',
      currency: formData.currency || 'OMR',
      openingBalance: formData.openingBalance || 0,
      currentBalance: formData.currentBalance || 0,
      availableBalance: formData.availableBalance || 0,
      overdraftLimit: formData.overdraftLimit || 0,
      accountingAccountId: 'acc_1120',
      isActive: formData.isActive !== false,
      isPrimary: formData.isPrimary || false,
      openedDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setAccounts([...accounts, newAccount]);
    setShowCreateModal(false);
    resetForm();
    alert('تم إضافة الحساب البنكي بنجاح!');
  };

  const handleEdit = (account: BankAccount) => {
    setSelectedAccount(account);
    setFormData(account);
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    if (!selectedAccount) return;

    const updatedAccounts = accounts.map(acc => 
      acc.id === selectedAccount.id 
        ? { ...acc, ...formData, updatedAt: new Date().toISOString() }
        : acc
    );

    setAccounts(updatedAccounts);
    setShowEditModal(false);
    setSelectedAccount(null);
    resetForm();
    alert('تم تحديث الحساب البنكي بنجاح!');
  };

  const handleViewDetails = (account: BankAccount) => {
    setSelectedAccount(account);
    setShowDetailsModal(true);
  };

  const handleReconciliation = (account: BankAccount) => {
    setSelectedAccount(account);
    setShowReconciliationModal(true);
  };

  const resetForm = () => {
    setFormData({
      accountName: '',
      accountNumber: '',
      iban: '',
      bankName: '',
      swiftCode: '',
      accountType: 'current',
      currency: 'OMR',
      openingBalance: 0,
      currentBalance: 0,
      availableBalance: 0,
      overdraftLimit: 0,
      isActive: true,
      isPrimary: false
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>الحسابات البنكية - النظام المالي</title></Head>

      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <AccountingTerm termKey="cash_flow">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <FiCreditCard className="text-blue-600" />
                الحسابات البنكية
              </h1>
            </AccountingTerm>
            <p className="text-gray-600 mt-2">إدارة حساباتك البنكية ومتابعة الأرصدة</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FiPlus />
            إضافة حساب بنكي
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">عدد الحسابات</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-xl shadow-sm p-6 border border-green-200">
            <p className="text-sm text-gray-600">حسابات نشطة</p>
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-blue-50 rounded-xl shadow-sm p-6 border border-blue-200">
            <p className="text-sm text-gray-600">إجمالي الأرصدة</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalBalance.toLocaleString()}</p>
            <p className="text-xs text-gray-500">ريال عُماني</p>
          </div>
          <div className="bg-purple-50 rounded-xl shadow-sm p-6 border border-purple-200">
            <p className="text-sm text-gray-600">الرصيد المتاح</p>
            <p className="text-2xl font-bold text-purple-600">{stats.totalAvailable.toLocaleString()}</p>
            <p className="text-xs text-gray-500">ريال عُماني</p>
          </div>
        </div>

        {/* Accounts Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {accounts.map((account) => (
            <div key={account.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className={`p-6 ${account.isPrimary ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gray-700'} text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm opacity-90">{account.bankName}</p>
                    <h3 className="text-xl font-bold">{account.accountName}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {account.isPrimary && (
                      <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-medium">
                        رئيسي
                      </span>
                    )}
                    <button
                      onClick={() => handleEdit(account)}
                      className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm opacity-75">رقم الحساب</p>
                  <p className="font-mono text-lg">{account.accountNumber}</p>
                  {account.iban && (
                    <p className="font-mono text-xs opacity-75">{account.iban}</p>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">الرصيد الحالي</p>
                    <p className="text-2xl font-bold text-gray-900">{account.currentBalance.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{account.currency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">الرصيد المتاح</p>
                    <p className="text-2xl font-bold text-green-600">{account.availableBalance.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{account.currency}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mb-4">
                  <div>
                    <span className="text-gray-500">النوع:</span> <strong>{account.accountType === 'current' ? 'جاري' : 'توفير'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">SWIFT:</span> <strong>{account.swiftCode}</strong>
                  </div>
                </div>

                {account.lastReconciliationDate && (
                  <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                    <p className="text-xs text-green-700">
                      <FiCheckCircle className="inline w-3 h-3 ml-1" />
                      آخر تسوية: {new Date(account.lastReconciliationDate).toLocaleDateString('ar-OM')}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(account)}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    عرض التفاصيل
                  </button>
                  <button
                    onClick={() => handleReconciliation(account)}
                    className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    تسوية بنكية
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-blue-600 p-6 text-white flex items-center justify-between">
                <h2 className="text-2xl font-bold">إضافة حساب بنكي جديد</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded">
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">اسم الحساب *</label>
                    <input
                      type="text"
                      value={formData.accountName}
                      onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="الحساب الجاري الرئيسي"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">رقم الحساب *</label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="0123456789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">IBAN</label>
                    <input
                      type="text"
                      value={formData.iban}
                      onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="OM23 001 0123456789012345"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">اسم البنك *</label>
                    <select
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">اختر البنك...</option>
                      <option value="بنك مسقط">بنك مسقط</option>
                      <option value="البنك الوطني العُماني">البنك الوطني العُماني</option>
                      <option value="بنك صحار الدولي">بنك صحار الدولي</option>
                      <option value="بنك ظفار">بنك ظفار</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">SWIFT Code</label>
                    <input
                      type="text"
                      value={formData.swiftCode}
                      onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="BMUSOMRX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">نوع الحساب *</label>
                    <select
                      value={formData.accountType}
                      onChange={(e) => setFormData({ ...formData, accountType: e.target.value as any })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="current">حساب جاري</option>
                      <option value="savings">حساب توفير</option>
                      <option value="business">حساب تجاري</option>
                    </select>
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
                    <label className="block text-sm font-medium mb-2">الرصيد الافتتاحي</label>
                    <input
                      type="number"
                      value={formData.openingBalance}
                      onChange={(e) => {
                        const opening = parseFloat(e.target.value) || 0;
                        setFormData({ 
                          ...formData, 
                          openingBalance: opening,
                          currentBalance: opening,
                          availableBalance: opening
                        });
                      }}
                      className="w-full px-4 py-2 border rounded-lg"
                      step="0.001"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isPrimary}
                      onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">حساب رئيسي</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive !== false}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">نشط</span>
                  </label>
                </div>
              </div>

              <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t">
                <button onClick={() => setShowCreateModal(false)} className="px-6 py-2 border rounded-lg">إلغاء</button>
                <button onClick={handleCreate} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <FiSave className="inline ml-2" />
                  حفظ الحساب
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
                <h2 className="text-2xl font-bold">تعديل الحساب البنكي</h2>
                <button onClick={() => setShowEditModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded">
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">اسم الحساب *</label>
                    <input
                      type="text"
                      value={formData.accountName}
                      onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">الرصيد الحالي</label>
                    <input
                      type="number"
                      value={formData.currentBalance}
                      onChange={(e) => setFormData({ ...formData, currentBalance: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border rounded-lg"
                      step="0.001"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t">
                <button onClick={() => setShowEditModal(false)} className="px-6 py-2 border rounded-lg">إلغاء</button>
                <button onClick={handleUpdate} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  تحديث
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedAccount && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-blue-600 p-6 text-white flex items-center justify-between">
                <h2 className="text-2xl font-bold">تفاصيل الحساب البنكي</h2>
                <button onClick={() => setShowDetailsModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded">
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">اسم الحساب</p>
                    <p className="font-bold text-gray-900">{selectedAccount.accountName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">اسم البنك</p>
                    <p className="font-bold text-gray-900">{selectedAccount.bankName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">رقم الحساب</p>
                    <p className="font-mono text-gray-900">{selectedAccount.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">IBAN</p>
                    <p className="font-mono text-xs text-gray-900">{selectedAccount.iban}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">SWIFT Code</p>
                    <p className="font-mono text-gray-900">{selectedAccount.swiftCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">نوع الحساب</p>
                    <p className="font-bold text-gray-900">
                      {selectedAccount.accountType === 'current' ? 'حساب جاري' : 'حساب توفير'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">الرصيد الحالي</p>
                    <p className="text-2xl font-bold text-green-600">{selectedAccount.currentBalance.toLocaleString()} {selectedAccount.currency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">الرصيد المتاح</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedAccount.availableBalance.toLocaleString()} {selectedAccount.currency}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-bold text-gray-900 mb-3">آخر المعاملات</h3>
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium">إيداع</p>
                        <p className="text-xs text-gray-500">2025-10-10</p>
                      </div>
                      <p className="font-bold text-green-600">+5,000.000 ر.ع</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium">سحب</p>
                        <p className="text-xs text-gray-500">2025-10-08</p>
                      </div>
                      <p className="font-bold text-red-600">-2,500.000 ر.ع</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 flex justify-end border-t">
                <button onClick={() => setShowDetailsModal(false)} className="px-6 py-2 border rounded-lg">إغلاق</button>
              </div>
            </div>
          </div>
        )}

        {/* Reconciliation Modal */}
        {showReconciliationModal && selectedAccount && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
              <div className="bg-purple-600 p-6 text-white flex items-center justify-between">
                <h2 className="text-2xl font-bold">التسوية البنكية</h2>
                <button onClick={() => setShowReconciliationModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded">
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="font-bold text-blue-900 mb-1">{selectedAccount.accountName}</p>
                  <p className="text-sm text-blue-700">رصيد النظام: {selectedAccount.currentBalance.toLocaleString()} {selectedAccount.currency}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">رصيد البنك (حسب الكشف)</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="0.000"
                      step="0.001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">تاريخ الكشف</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border rounded-lg"
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700">
                    <FiCheckCircle className="inline ml-1" />
                    سيتم تحديث تاريخ آخر تسوية تلقائياً
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t">
                <button onClick={() => setShowReconciliationModal(false)} className="px-6 py-2 border rounded-lg">إلغاء</button>
                <button
                  onClick={() => {
                    alert('تمت التسوية البنكية بنجاح!');
                    setShowReconciliationModal(false);
                  }}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  إتمام التسوية
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
