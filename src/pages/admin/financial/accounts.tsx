// src/pages/admin/financial/accounts.tsx - دليل الحسابات
import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  FiPieChart, FiPlus, FiEdit, FiTrash2, FiChevronDown, FiChevronUp,
  FiDollarSign, FiTrendingUp, FiTrendingDown, FiMinusCircle
} from 'react-icons/fi';
import { CHART_OF_ACCOUNTS, getSubAccounts } from '@/lib/chart-of-accounts';
import { Account, AccountType } from '@/types/financial';

export default function AccountsPage() {
  const router = useRouter();
  const [expandedAccounts, setExpandedAccounts] = useState<string[]>(['acc_1100', 'acc_2100', 'acc_4000', 'acc_5000']);

  const toggleAccount = (accountId: string) => {
    if (expandedAccounts.includes(accountId)) {
      setExpandedAccounts(expandedAccounts.filter(id => id !== accountId));
    } else {
      setExpandedAccounts([...expandedAccounts, accountId]);
    }
  };

  const getAccountTypeColor = (type: AccountType) => {
    switch (type) {
      case 'asset': return 'text-green-600 bg-green-50';
      case 'liability': return 'text-red-600 bg-red-50';
      case 'equity': return 'text-blue-600 bg-blue-50';
      case 'revenue': return 'text-purple-600 bg-purple-50';
      case 'expense': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getAccountTypeIcon = (type: AccountType) => {
    switch (type) {
      case 'asset': return <FiTrendingUp className="w-5 h-5" />;
      case 'liability': return <FiTrendingDown className="w-5 h-5" />;
      case 'equity': return <FiPieChart className="w-5 h-5" />;
      case 'revenue': return <FiDollarSign className="w-5 h-5" />;
      case 'expense': return <FiMinusCircle className="w-5 h-5" />;
      default: return <FiPieChart className="w-5 h-5" />;
    }
  };

  // تجميع الحسابات حسب النوع
  const mainAccounts = CHART_OF_ACCOUNTS.filter(acc => !acc.parentAccountId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>دليل الحسابات - النظام المالي</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FiPieChart className="text-blue-600" />
                دليل الحسابات
              </h1>
              <p className="text-gray-600 mt-2">Chart of Accounts - الدليل المحاسبي الشامل</p>
            </div>
            
            <button
              onClick={() => alert('إضافة حساب جديد')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FiPlus />
              حساب جديد
            </button>
          </div>
        </div>

        {/* Account Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <FiTrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {CHART_OF_ACCOUNTS.filter(a => a.type === 'asset').length}
            </p>
            <p className="text-xs text-gray-600">أصول</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <FiTrendingDown className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">
              {CHART_OF_ACCOUNTS.filter(a => a.type === 'liability').length}
            </p>
            <p className="text-xs text-gray-600">خصوم</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <FiPieChart className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">
              {CHART_OF_ACCOUNTS.filter(a => a.type === 'equity').length}
            </p>
            <p className="text-xs text-gray-600">حقوق ملكية</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <FiDollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">
              {CHART_OF_ACCOUNTS.filter(a => a.type === 'revenue').length}
            </p>
            <p className="text-xs text-gray-600">إيرادات</p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
            <FiMinusCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-600">
              {CHART_OF_ACCOUNTS.filter(a => a.type === 'expense').length}
            </p>
            <p className="text-xs text-gray-600">مصروفات</p>
          </div>
        </div>

        {/* Accounts List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="space-y-2">
              {mainAccounts.map((account) => {
                const subAccounts = getSubAccounts(account.id);
                const isExpanded = expandedAccounts.includes(account.id);

                return (
                  <div key={account.id} className="border border-gray-200 rounded-lg">
                    {/* Main Account */}
                    <div
                      onClick={() => toggleAccount(account.id)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${getAccountTypeColor(account.type)}`}
                    >
                      <div className="flex items-center gap-3">
                        {getAccountTypeIcon(account.type)}
                        <div>
                          <div className="font-bold text-gray-900">
                            {account.code} - {account.name.ar}
                          </div>
                          <div className="text-sm text-gray-600">{account.name.en}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            {account.balance.toLocaleString()} {account.currency}
                          </div>
                        </div>
                        {subAccounts.length > 0 && (
                          isExpanded ? <FiChevronUp /> : <FiChevronDown />
                        )}
                      </div>
                    </div>

                    {/* Sub Accounts */}
                    {isExpanded && subAccounts.length > 0 && (
                      <div className="bg-gray-50 p-4 border-t">
                        {subAccounts.map((subAcc) => (
                          <div
                            key={subAcc.id}
                            className="p-3 mb-2 bg-white rounded border border-gray-200 hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-gray-800">
                                  {subAcc.code} - {subAcc.name.ar}
                                </div>
                                <div className="text-xs text-gray-500">{subAcc.name.en}</div>
                                {subAcc.description && (
                                  <div className="text-xs text-gray-600 mt-1">{subAcc.description}</div>
                                )}
                              </div>
                              
                              <div className="text-right">
                                <div className="font-semibold text-gray-900">
                                  {subAcc.balance.toLocaleString()} {subAcc.currency}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

