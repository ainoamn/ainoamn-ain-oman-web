// General Ledger - دفتر الأستاذ
import React from 'react';
import Head from 'next/head';
import { FiCalendar } from 'react-icons/fi';

export default function LedgerPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>دفتر الأستاذ العام</title></Head>
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <FiCalendar className="text-indigo-600" />
        دفتر الأستاذ العام (General Ledger)
      </h1>

      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-600">سجل تفصيلي لجميع المعاملات المحاسبية</p>
      </div>
    </div>
  );
}

