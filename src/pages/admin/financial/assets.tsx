// src/pages/admin/financial/assets.tsx - نظام الأصول الثابتة المتقدم
import React, { useState } from 'react';
import Head from 'next/head';
import {
  FiHome, FiTruck, FiMonitor, FiPlus, FiTrendingDown, FiDollarSign,
  FiCalendar, FiAlertCircle, FiX, FiSave, FiEye
} from 'react-icons/fi';
import { FixedAsset } from '@/types/financial';
import { AccountingTerm } from '@/components/common/SmartTooltip';

export default function AssetsPage() {
  const [assets, setAssets] = useState<FixedAsset[]>([
    {
      id: 'asset_1',
      assetNumber: 'ASSET-2024-001',
      name: 'فيلا الخوير الاستثمارية',
      category: 'property',
      purchasePrice: 500000,
      currentValue: 475000,
      accumulatedDepreciation: 25000,
      bookValue: 475000,
      depreciationMethod: 'straight_line',
      usefulLife: 20,
      depreciationRate: 5,
      annualDepreciation: 25000,
      purchaseDate: '2024-01-15',
      depreciationStartDate: '2024-01-15',
      propertyId: 'prop_001',
      accountId: 'acc_1210',
      depreciationAccountId: 'acc_1290',
      status: 'active',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<FixedAsset | null>(null);
  const [formData, setFormData] = useState<Partial<FixedAsset>>({
    name: '',
    category: 'equipment',
    purchasePrice: 0,
    usefulLife: 5,
    depreciationMethod: 'straight_line',
    purchaseDate: new Date().toISOString().split('T')[0],
    status: 'active'
  });

  const stats = {
    total: assets.length,
    totalValue: assets.reduce((sum, a) => sum + a.currentValue, 0),
    totalDepreciation: assets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0),
    totalBookValue: assets.reduce((sum, a) => sum + a.bookValue, 0)
  };

  const calculateDepreciation = () => {
    const purchasePrice = formData.purchasePrice || 0;
    const usefulLife = formData.usefulLife || 1;
    
    if (formData.depreciationMethod === 'straight_line') {
      const annualDepreciation = purchasePrice / usefulLife;
      const depreciationRate = (1 / usefulLife) * 100;
      
      setFormData({
        ...formData,
        annualDepreciation,
        depreciationRate,
        currentValue: purchasePrice,
        bookValue: purchasePrice,
        accumulatedDepreciation: 0
      });
    }
  };

  const handleCreate = () => {
    if (!formData.name || !formData.purchasePrice) {
      alert('الرجاء ملء الحقول المطلوبة');
      return;
    }

    const newAsset: FixedAsset = {
      id: `asset_${Date.now()}`,
      assetNumber: `ASSET-${new Date().getFullYear()}-${String(assets.length + 1).padStart(3, '0')}`,
      name: formData.name || '',
      category: formData.category || 'equipment',
      purchasePrice: formData.purchasePrice || 0,
      currentValue: formData.currentValue || formData.purchasePrice || 0,
      accumulatedDepreciation: formData.accumulatedDepreciation || 0,
      bookValue: formData.bookValue || formData.purchasePrice || 0,
      depreciationMethod: formData.depreciationMethod || 'straight_line',
      usefulLife: formData.usefulLife || 5,
      depreciationRate: formData.depreciationRate || 0,
      annualDepreciation: formData.annualDepreciation || 0,
      purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
      depreciationStartDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
      accountId: 'acc_1210',
      depreciationAccountId: 'acc_1290',
      status: formData.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setAssets([...assets, newAsset]);
    setShowCreateModal(false);
    alert('تم إضافة الأصل بنجاح!');
  };

  const handleViewDetails = (asset: FixedAsset) => {
    setSelectedAsset(asset);
    setShowDetailsModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>الأصول الثابتة - النظام المالي</title></Head>

      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <AccountingTerm termKey="fixed_assets">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <FiHome className="text-green-600" />
                الأصول الثابتة
              </h1>
            </AccountingTerm>
            <p className="text-gray-600 mt-2">إدارة الأصول طويلة الأجل والإهلاك</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
          >
            <FiPlus />
            إضافة أصل
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">عدد الأصول</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-xl shadow-sm p-6 border border-green-200">
            <p className="text-sm text-gray-600">القيمة الحالية</p>
            <p className="text-2xl font-bold text-green-600">{stats.totalValue.toLocaleString()}</p>
            <p className="text-xs text-gray-500">ريال عُماني</p>
          </div>
          <div className="bg-red-50 rounded-xl shadow-sm p-6 border border-red-200">
            <AccountingTerm termKey="depreciation">
              <p className="text-sm text-gray-600">الإهلاك المتراكم</p>
            </AccountingTerm>
            <p className="text-2xl font-bold text-red-600">{stats.totalDepreciation.toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 rounded-xl shadow-sm p-6 border border-blue-200">
            <p className="text-sm text-gray-600">القيمة الدفترية</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalBookValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Assets List */}
        <div className="space-y-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => handleViewDetails(asset)}
              className="bg-white rounded-xl shadow-sm border p-6 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    {asset.category === 'property' && <FiHome className="w-6 h-6 text-green-600" />}
                    {asset.category === 'vehicle' && <FiTruck className="w-6 h-6 text-green-600" />}
                    {asset.category === 'equipment' && <FiMonitor className="w-6 h-6 text-green-600" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{asset.name}</h3>
                    <p className="text-sm text-gray-500">رقم: {asset.assetNumber}</p>
                  </div>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                  {asset.status === 'active' ? 'نشط' : 'متوقف'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">سعر الشراء</p>
                  <p className="font-semibold">{asset.purchasePrice.toLocaleString()} ر.ع</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">القيمة الحالية</p>
                  <p className="font-semibold text-green-600">{asset.currentValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">الإهلاك المتراكم</p>
                  <p className="font-semibold text-red-600">({asset.accumulatedDepreciation.toLocaleString()})</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">القيمة الدفترية</p>
                  <p className="font-semibold text-blue-600">{asset.bookValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">الإهلاك السنوي</p>
                  <p className="font-semibold">{asset.annualDepreciation.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-gray-600">
                <div>
                  <span>تاريخ الشراء: {new Date(asset.purchaseDate).toLocaleDateString('ar-OM')}</span>
                  <span className="mx-2">|</span>
                  <span>العمر الإنتاجي: {asset.usefulLife} سنة</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(asset);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <FiEye className="w-4 h-4" />
                  عرض التفاصيل
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-green-600 p-6 text-white flex items-center justify-between">
                <h2 className="text-2xl font-bold">إضافة أصل ثابت جديد</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded">
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">اسم الأصل *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="مثال: سيارة نقل - تويوتا"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">الفئة *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="property">عقار</option>
                      <option value="vehicle">مركبة</option>
                      <option value="equipment">معدات</option>
                      <option value="furniture">أثاث</option>
                      <option value="other">أخرى</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">سعر الشراء *</label>
                    <input
                      type="number"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border rounded-lg"
                      step="0.001"
                      onBlur={calculateDepreciation}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">العمر الإنتاجي (سنوات) *</label>
                    <input
                      type="number"
                      value={formData.usefulLife}
                      onChange={(e) => setFormData({ ...formData, usefulLife: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2 border rounded-lg"
                      onBlur={calculateDepreciation}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">طريقة الإهلاك</label>
                    <select
                      value={formData.depreciationMethod}
                      onChange={(e) => setFormData({ ...formData, depreciationMethod: e.target.value as any })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="straight_line">القسط الثابت</option>
                      <option value="declining_balance">الرصيد المتناقص</option>
                      <option value="units_of_production">وحدات الإنتاج</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">تاريخ الشراء *</label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                {formData.annualDepreciation !== undefined && formData.annualDepreciation > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-bold text-blue-900 mb-2">معاينة الإهلاك:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-blue-700">الإهلاك السنوي:</p>
                        <p className="font-bold">{formData.annualDepreciation.toFixed(3)} ر.ع</p>
                      </div>
                      <div>
                        <p className="text-blue-700">معدل الإهلاك:</p>
                        <p className="font-bold">{formData.depreciationRate?.toFixed(2)}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t">
                <button onClick={() => setShowCreateModal(false)} className="px-6 py-2 border rounded-lg">إلغاء</button>
                <button onClick={handleCreate} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <FiSave className="inline ml-2" />
                  حفظ الأصل
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedAsset && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-green-600 p-6 text-white flex items-center justify-between">
                <h2 className="text-2xl font-bold">تفاصيل الأصل</h2>
                <button onClick={() => setShowDetailsModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded">
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedAsset.name}</h3>
                  <p className="text-sm text-gray-500">رقم: {selectedAsset.assetNumber}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">الفئة</p>
                    <p className="font-bold text-gray-900">
                      {selectedAsset.category === 'property' ? 'عقار' :
                       selectedAsset.category === 'vehicle' ? 'مركبة' :
                       selectedAsset.category === 'equipment' ? 'معدات' : 'أخرى'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">تاريخ الشراء</p>
                    <p className="font-bold text-gray-900">{new Date(selectedAsset.purchaseDate).toLocaleDateString('ar-OM')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">سعر الشراء</p>
                    <p className="text-xl font-bold text-gray-900">{selectedAsset.purchasePrice.toLocaleString()} ر.ع</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">القيمة الحالية</p>
                    <p className="text-xl font-bold text-green-600">{selectedAsset.currentValue.toLocaleString()} ر.ع</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">الإهلاك المتراكم</p>
                    <p className="text-xl font-bold text-red-600">({selectedAsset.accumulatedDepreciation.toLocaleString()}) ر.ع</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">القيمة الدفترية</p>
                    <p className="text-xl font-bold text-blue-600">{selectedAsset.bookValue.toLocaleString()} ر.ع</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-bold text-gray-900 mb-3">معلومات الإهلاك</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">طريقة الإهلاك</p>
                      <p className="font-bold">
                        {selectedAsset.depreciationMethod === 'straight_line' ? 'القسط الثابت' : 'الرصيد المتناقص'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">العمر الإنتاجي</p>
                      <p className="font-bold">{selectedAsset.usefulLife} سنة</p>
                    </div>
                    <div>
                      <p className="text-gray-500">الإهلاك السنوي</p>
                      <p className="font-bold text-orange-600">{selectedAsset.annualDepreciation.toLocaleString()} ر.ع</p>
                    </div>
                    <div>
                      <p className="text-gray-500">معدل الإهلاك</p>
                      <p className="font-bold">{selectedAsset.depreciationRate}%</p>
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

      </div>
    </div>
  );
}
