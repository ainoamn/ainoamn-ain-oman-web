// src/pages/admin/financial/payroll/index.tsx - نظام الرواتب
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FiUsers, FiDollarSign, FiFileText, FiCalendar } from 'react-icons/fi';

export default function PayrollIndexPage() {
  const router = useRouter();

  const modules = [
    {
      id: 'processor',
      name: 'مسيّر الرواتب',
      description: 'معالجة وحساب رواتب الموظفين',
      icon: FiCalendar,
      color: 'blue',
      path: '/admin/financial/payroll/processor'
    },
    {
      id: 'disbursement',
      name: 'صرف الرواتب',
      description: 'صرف ودفع رواتب الموظفين',
      icon: FiDollarSign,
      color: 'green',
      path: '/admin/financial/payroll/disbursement'
    },
    {
      id: 'employees',
      name: 'الموظفين',
      description: 'بيانات الموظفين ومعلوماتهم',
      icon: FiUsers,
      color: 'purple',
      path: '/admin/financial/payroll/employees'
    },
    {
      id: 'claims',
      name: 'مطالبات الموظفين',
      description: 'طلبات السلف والمطالبات',
      icon: FiFileText,
      color: 'orange',
      path: '/admin/financial/payroll/claims'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>الرواتب والموظفين - النظام المالي</title></Head>

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FiUsers className="text-blue-600" />
            نظام الرواتب والموظفين
          </h1>
          <p className="text-gray-600 mt-2">إدارة شاملة للموارد البشرية والرواتب</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            const colorClasses = {
              blue: 'from-blue-500 to-blue-600',
              green: 'from-green-500 to-green-600',
              purple: 'from-purple-500 to-purple-600',
              orange: 'from-orange-500 to-orange-600'
            };

            return (
              <div
                key={module.id}
                onClick={() => router.push(module.path)}
                className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
              >
                <div className={`bg-gradient-to-br ${colorClasses[module.color as keyof typeof colorClasses]} p-6 text-white`}>
                  <Icon className="w-10 h-10 mb-3" />
                  <h3 className="text-xl font-bold mb-1">{module.name}</h3>
                  <p className="text-sm text-white text-opacity-90">{module.description}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

