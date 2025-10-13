// src/pages/admin/financial/cost-centers.tsx - نظام مراكز التكلفة
import React, { useState } from 'react';
import Head from 'next/head';
import { FiTarget, FiPlus, FiPieChart, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { AccountingTerm } from '@/components/common/SmartTooltip';

interface CostCenter {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'branch' | 'department' | 'project' | 'property';
  parentId?: string;
  managerId?: string;
  budget: number;
  actualSpending: number;
  revenue: number;
  profit: number;
  isActive: boolean;
  createdAt: string;
}

export default function CostCentersPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<Partial<CostCenter>>({
    code: '',
    name: '',
    description: '',
    type: 'branch',
    budget: 0,
    actualSpending: 0,
    revenue: 0,
    profit: 0,
    isActive: true
  });
  
  const [costCenters, setCostCenters] = useState<CostCenter[]>([
    {
      id: 'cc_1',
      code: 'BR-MSQ',
      name: 'فرع مسقط',
      description: 'الفرع الرئيسي في مسقط',
      type: 'branch',
      budget: 0 // تم تصفير من 500000,
      actualSpending: 0 // تم تصفير من 380000,
      revenue: 0 // تم تصفير من 650000,
      profit: 0 // تم تصفير من 270000,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'cc_2',
      code: 'BR-SLL',
      name: 'فرع صلالة',
      description: 'فرع صلالة',
      type: 'branch',
      budget: 0 // تم تصفير من 300000,
      actualSpending: 0 // تم تصفير من 245000,
      revenue: 0 // تم تصفير من 410000,
      profit: 0 // تم تصفير من 165000,
      isActive: true,
      createdAt: '2024-02-01T00:00:00Z'
    },
    {
      id: 'cc_3',
      code: 'PRJ-001',
      name: 'مشروع البناء - المعبيلة',
      description: 'مشروع تطوير عقاري',
      type: 'project',
      budget: 0 // تم تصفير من 1000000,
      actualSpending: 0 // تم تصفير من 720000,
      revenue: 0 // تم تصفير من 850000,
      profit: 0 // تم تصفير من 130000,
      isActive: true,
      createdAt: '2024-03-01T00:00:00Z'
    }
  ]);

  const stats = {
    total: costCenters.length,
    active: costCenters.filter(c => c.isActive).length,
    totalBudget: costCenters.reduce((sum, c) => sum + c.budget, 0),
    totalSpending: costCenters.reduce((sum, c) => sum + c.actualSpending, 0),
    totalRevenue: costCenters.reduce((sum, c) => sum + c.revenue, 0),
    totalProfit: costCenters.reduce((sum, c) => sum + c.profit, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>مراكز التكلفة - النظام المالي</title></Head>

      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <AccountingTerm termKey="cost_center">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <FiTarget className="text-indigo-600" />
                مراكز التكلفة
              </h1>
            </AccountingTerm>
            <p className="text-gray-600 mt-2">تحليل الربحية حسب الفرع، القسم، أو المشروع</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
          >
            <FiPlus />
            إضافة مركز تكلفة
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-600">مراكز التكلفة</p>
          </div>
          <div className="bg-blue-50 rounded-xl shadow-sm p-4 text-center border border-blue-200">
            <p className="text-xl font-bold text-blue-600">{(stats.totalBudget / 1000).toFixed(0)}K</p>
            <p className="text-xs text-blue-700">الموازنة</p>
          </div>
          <div className="bg-orange-50 rounded-xl shadow-sm p-4 text-center border border-orange-200">
            <p className="text-xl font-bold text-orange-600">{(stats.totalSpending / 1000).toFixed(0)}K</p>
            <p className="text-xs text-orange-700">المصروفات</p>
          </div>
          <div className="bg-green-50 rounded-xl shadow-sm p-4 text-center border border-green-200">
            <p className="text-xl font-bold text-green-600">{(stats.totalRevenue / 1000).toFixed(0)}K</p>
            <p className="text-xs text-green-700">الإيرادات</p>
          </div>
          <div className="bg-purple-50 rounded-xl shadow-sm p-4 text-center border border-purple-200">
            <p className="text-xl font-bold text-purple-600">{(stats.totalProfit / 1000).toFixed(0)}K</p>
            <p className="text-xs text-purple-700">الربح</p>
          </div>
          <div className="bg-indigo-50 rounded-xl shadow-sm p-4 text-center border border-indigo-200">
            <p className="text-xl font-bold text-indigo-600">{((stats.totalProfit / stats.totalRevenue) * 100).toFixed(1)}%</p>
            <p className="text-xs text-indigo-700">هامش الربح</p>
          </div>
        </div>

        {/* Cost Centers List */}
        <div className="space-y-4">
          {costCenters.map((center) => {
            const budgetUsage = (center.actualSpending / center.budget) * 100;
            const profitMargin = (center.profit / center.revenue) * 100;

            return (
              <div key={center.id} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-900">{center.name}</h3>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {center.code}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        center.type === 'branch' ? 'bg-blue-100 text-blue-700' :
                        center.type === 'project' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {center.type === 'branch' ? 'فرع' : 
                         center.type === 'project' ? 'مشروع' : 
                         center.type === 'department' ? 'قسم' : 'عقار'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{center.description}</p>
                  </div>
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    عرض التفاصيل →
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">الموازنة</p>
                    <p className="text-lg font-bold text-gray-900">{center.budget.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">المصروفات الفعلية</p>
                    <p className="text-lg font-bold text-orange-600">{center.actualSpending.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{budgetUsage.toFixed(1)}% من الموازنة</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">الإيرادات</p>
                    <p className="text-lg font-bold text-green-600">{center.revenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">الربح</p>
                    <p className="text-lg font-bold text-purple-600">{center.profit.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">هامش الربح</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-indigo-600">{profitMargin.toFixed(1)}%</p>
                      {profitMargin > 30 ? (
                        <FiTrendingUp className="text-green-500" />
                      ) : (
                        <FiTrendingDown className="text-orange-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Budget Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>استخدام الموازنة</span>
                    <span>{budgetUsage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        budgetUsage > 90 ? 'bg-red-500' : 
                        budgetUsage > 75 ? 'bg-orange-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
              <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
                <h2 className="text-2xl font-bold">إضافة مركز تكلفة جديد</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded"
                >
                  <FiPlus className="rotate-45 w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">الرمز *</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="BR-MSQ"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">النوع *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="branch">فرع</option>
                      <option value="department">قسم</option>
                      <option value="project">مشروع</option>
                      <option value="property">عقار</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">الاسم *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="فرع مسقط"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">الوصف</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">الموازنة السنوية</label>
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border rounded-lg"
                      step="0.001"
                    />
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
                  onClick={() => {
                    if (!formData.code || !formData.name) {
                      alert('الرجاء ملء الرمز والاسم');
                      return;
                    }
                    const newCenter: CostCenter = {
                      id: `cc_${Date.now()}`,
                      code: formData.code || '',
                      name: formData.name || '',
                      description: formData.description || '',
                      type: formData.type || 'branch',
                      budget: formData.budget || 0,
                      actualSpending: formData.actualSpending || 0,
                      revenue: formData.revenue || 0,
                      profit: formData.profit || 0,
                      isActive: true,
                      createdAt: new Date().toISOString()
                    };
                    setCostCenters([...costCenters, newCenter]);
                    setShowCreateModal(false);
                    alert('تم إضافة مركز التكلفة بنجاح!');
                  }}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
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

