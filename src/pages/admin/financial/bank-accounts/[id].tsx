// src/pages/admin/financial/bank-accounts/[id].tsx - صفحة تفاصيل الحساب البنكي
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  FiCreditCard, FiArrowLeft, FiEdit, FiTrash2, FiCheckCircle,
  FiTrendingUp, FiTrendingDown, FiCalendar, FiDollarSign
} from 'react-icons/fi';
import { BankAccount } from '@/types/contacts';

export default function BankAccountDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadAccountDetails();
    }
  }, [id]);

  const loadAccountDetails = () => {
    // بيانات تجريبية - في الإنتاج يتم جلبها من API
    const mockAccounts: Record<string, BankAccount> = {
      'bank_1': {
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
        openingBalance: 50000,
        currentBalance: 67850.50,
        availableBalance: 67850.50,
        overdraftLimit: 0,
        accountingAccountId: 'acc_1120',
        isActive: true,
        isPrimary: true,
        openedDate: '2024-01-01',
        lastReconciliationDate: '2025-01-10',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z'
      },
      'bank_2': {
        id: 'bank_2',
        accountName: 'حساب التوفير',
        accountNumber: '9876543210',
        iban: 'OM23 002 9876543210123456',
        bankName: 'البنك الوطني العُماني',
        bankCode: '002',
        swiftCode: 'NBOMOMRX',
        accountType: 'savings',
        currency: 'OMR',
        openingBalance: 100000,
        currentBalance: 125420.75,
        availableBalance: 125420.75,
        overdraftLimit: 0,
        accountingAccountId: 'acc_1120',
        isActive: true,
        isPrimary: false,
        openedDate: '2024-03-01',
        createdAt: '2024-03-01T00:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z'
      }
    };

    const foundAccount = mockAccounts[id as string];
    if (foundAccount) {
      setAccount(foundAccount);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">الحساب غير موجود</h1>
          <button
            onClick={() => router.push('/admin/financial/bank-accounts')}
            className="text-blue-600 hover:text-blue-800"
          >
            العودة إلى الحسابات البنكية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>تفاصيل الحساب البنكي - {account.accountName}</title></Head>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/financial/bank-accounts')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
          >
            <FiArrowLeft />
            العودة إلى الحسابات البنكية
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{account.accountName}</h1>
              <p className="text-gray-600 mt-1">{account.bankName}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <FiEdit />
                تعديل
              </button>
            </div>
          </div>
        </div>

        {/* Account Info Card */}
        <div className={`rounded-xl shadow-lg p-8 mb-8 ${account.isPrimary ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gray-700'} text-white`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm opacity-75 mb-1">رقم الحساب</p>
              <p className="text-2xl font-mono font-bold">{account.accountNumber}</p>
            </div>
            <div>
              <p className="text-sm opacity-75 mb-1">IBAN</p>
              <p className="text-lg font-mono">{account.iban}</p>
            </div>
            <div>
              <p className="text-sm opacity-75 mb-1">SWIFT Code</p>
              <p className="text-lg font-mono">{account.swiftCode}</p>
            </div>
            <div>
              <p className="text-sm opacity-75 mb-1">نوع الحساب</p>
              <p className="text-lg font-bold">
                {account.accountType === 'current' ? 'حساب جاري' : 
                 account.accountType === 'savings' ? 'حساب توفير' : 'حساب تجاري'}
              </p>
            </div>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-r-4 border-green-500">
            <p className="text-sm text-gray-600 mb-2">الرصيد الحالي</p>
            <p className="text-3xl font-bold text-green-600">{account.currentBalance.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{account.currency}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-r-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-2">الرصيد المتاح</p>
            <p className="text-3xl font-bold text-blue-600">{account.availableBalance.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{account.currency}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-r-4 border-purple-500">
            <p className="text-sm text-gray-600 mb-2">الرصيد الافتتاحي</p>
            <p className="text-3xl font-bold text-purple-600">{account.openingBalance.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{account.currency}</p>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">معلومات الحساب</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">الفرع</p>
              <p className="font-bold text-gray-900">{account.branchName || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">تاريخ الفتح</p>
              <p className="font-bold text-gray-900">{new Date(account.openedDate).toLocaleDateString('ar-OM')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">آخر تسوية</p>
              <p className="font-bold text-gray-900">
                {account.lastReconciliationDate 
                  ? new Date(account.lastReconciliationDate).toLocaleDateString('ar-OM')
                  : 'لم يتم'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">الحالة</p>
              <p className="font-bold text-green-600 flex items-center gap-2">
                <FiCheckCircle />
                {account.isActive ? 'نشط' : 'غير نشط'}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">آخر المعاملات</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiTrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">إيداع نقدي</p>
                  <p className="text-xs text-gray-500">2025-10-10 • 10:30 صباحاً</p>
                </div>
              </div>
              <p className="text-xl font-bold text-green-600">+5,000.000 ر.ع</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FiTrendingDown className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">سحب لدفع مورد</p>
                  <p className="text-xs text-gray-500">2025-10-08 • 02:15 مساءً</p>
                </div>
              </div>
              <p className="text-xl font-bold text-red-600">-2,500.000 ر.ع</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiDollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">تحويل بنكي واصل</p>
                  <p className="text-xs text-gray-500">2025-10-05 • 11:00 صباحاً</p>
                </div>
              </div>
              <p className="text-xl font-bold text-blue-600">+10,000.000 ر.ع</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

