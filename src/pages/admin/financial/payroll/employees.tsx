// src/pages/admin/financial/payroll/employees.tsx - الموظفين
import React, { useState } from 'react';
import Head from 'next/head';
import { FiUsers, FiPlus, FiX, FiSave } from 'react-icons/fi';

export default function EmployeesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    salary: 0,
    startDate: new Date().toISOString().split('T')[0]
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>الموظفين</title></Head>
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FiUsers className="text-purple-600" />
            الموظفين
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
          >
            <FiPlus />
            إضافة موظف
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600 text-center py-8">بيانات الموظفين ومعلوماتهم الوظيفية</p>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full">
              <div className="bg-purple-600 p-6 text-white flex items-center justify-between">
                <h2 className="text-2xl font-bold">إضافة موظف جديد</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-white p-2 rounded hover:bg-white hover:bg-opacity-20">
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">الاسم الكامل *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">المسمى الوظيفي *</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">الراتب الأساسي *</label>
                    <input
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border rounded-lg"
                      step="0.001"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">تاريخ التعيين</label>
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
                <button
                  onClick={() => {
                    if (!formData.name || !formData.position || formData.salary <= 0) {
                      alert('الرجاء ملء جميع الحقول');
                      return;
                    }
                    alert('تم إضافة الموظف بنجاح!');
                    setShowCreateModal(false);
                  }}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
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
