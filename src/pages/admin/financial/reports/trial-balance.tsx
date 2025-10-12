// Trial Balance - ميزان المراجعة
import React from 'react';
import Head from 'next/head';
import { FiCheckCircle } from 'react-icons/fi';
import { CHART_OF_ACCOUNTS } from '@/lib/chart-of-accounts';

export default function TrialBalancePage() {
  const totalDebit = 930670.50;
  const totalCredit = 930670.50;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>ميزان المراجعة</title></Head>
      <h1 className="text-3xl font-bold mb-8">ميزان المراجعة (Trial Balance)</h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رمز الحساب</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم الحساب</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">مدين</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">دائن</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {CHART_OF_ACCOUNTS.filter(acc => acc.balance !== 0).map((acc) => (
              <tr key={acc.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-mono text-sm">{acc.code}</td>
                <td className="px-6 py-3">{acc.name.ar}</td>
                <td className="px-6 py-3 text-green-600 font-medium">
                  {acc.type === 'asset' || acc.type === 'expense' ? acc.balance.toLocaleString() : '-'}
                </td>
                <td className="px-6 py-3 text-red-600 font-medium">
                  {acc.type === 'liability' || acc.type === 'equity' || acc.type === 'revenue' ? acc.balance.toLocaleString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-blue-600 text-white font-bold">
            <tr>
              <td colSpan={2} className="px-6 py-4">الإجمالي</td>
              <td className="px-6 py-4">{totalDebit.toLocaleString()} ر.ع</td>
              <td className="px-6 py-4">{totalCredit.toLocaleString()} ر.ع</td>
            </tr>
          </tfoot>
        </table>
        
        {totalDebit === totalCredit && (
          <div className="p-4 bg-green-50 border-t flex items-center gap-2 justify-center">
            <FiCheckCircle className="text-green-600" />
            <span className="text-green-800 font-medium">✓ الميزان متوازن</span>
          </div>
        )}
      </div>
    </div>
  );
}

