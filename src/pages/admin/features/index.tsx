// src/pages/admin/features/index.tsx - لوحة التحكم الإدارية للميزات
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import InstantLink from '@/components/InstantLink';
import { FeatureConfig, FeatureId, FeatureOverride } from '@/types/features';
import {
  FaCog, FaToggleOn, FaToggleOff, FaEdit, FaTrash, FaPlus,
  FaSearch, FaFilter, FaChartLine, FaUsers, FaBuilding, FaGlobe,
  FaSpinner, FaCheckCircle, FaTimesCircle, FaExclamationTriangle,
  FaInfoCircle, FaLock, FaUnlock, FaEye, FaEyeSlash
} from 'react-icons/fa';

export default function AdminFeaturesPage() {
  const router = useRouter();
  const [features, setFeatures] = useState<FeatureConfig[]>([]);
  const [overrides, setOverrides] = useState<FeatureOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterEnabled, setFilterEnabled] = useState<string>('all');
  const [selectedFeature, setSelectedFeature] = useState<FeatureConfig | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [stats, setStats] = useState<Record<string, any>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [featuresRes, overridesRes] = await Promise.all([
        fetch('/api/features'),
        fetch('/api/features/overrides'),
      ]);

      if (featuresRes.ok) {
        const featuresData = await featuresRes.json();
        setFeatures(Array.isArray(featuresData.features) ? featuresData.features : 
                   Array.isArray(featuresData) ? featuresData : []);
      }

      if (overridesRes.ok) {
        const overridesData = await overridesRes.json();
        setOverrides(overridesData.overrides || []);
      }

      // تحميل الإحصائيات
      const statsPromises = features.map(f => 
        fetch(`/api/features?id=${f.id}&stats=true`).then(r => r.json())
      );
      const statsResults = await Promise.all(statsPromises);
      const statsMap: Record<string, any> = {};
      statsResults.forEach((result, index) => {
        if (result.stats) {
          statsMap[features[index].id] = result.stats;
        }
      });
      setStats(statsMap);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeature = async (feature: FeatureConfig) => {
    try {
      const response = await fetch('/api/features', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: feature.id,
          enabled: !feature.enabled,
          updatedBy: 'admin', // TODO: استخدام المستخدم الحالي
        }),
      });

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Error toggling feature:', error);
      alert('حدث خطأ أثناء تحديث الميزة');
    }
  };

  const handleDeleteFeature = async (featureId: FeatureId) => {
    if (!confirm('هل أنت متأكد من حذف هذه الميزة؟')) return;

    try {
      const response = await fetch(`/api/features?id=${featureId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Error deleting feature:', error);
      alert('حدث خطأ أثناء حذف الميزة');
    }
  };

  const filteredFeatures = features.filter(feature => {
    if (searchQuery && !feature.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !feature.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterCategory !== 'all' && feature.metadata?.category !== filterCategory) {
      return false;
    }
    if (filterEnabled === 'enabled' && !feature.enabled) return false;
    if (filterEnabled === 'disabled' && feature.enabled) return false;
    return true;
  });

  const categories = Array.from(new Set(features.map(f => f.metadata?.category).filter(Boolean)));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Head>
        <title>إدارة الميزات - لوحة التحكم</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        {/* العنوان */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">إدارة الميزات</h1>
            <p className="text-gray-600">التحكم الكامل في جميع ميزات المنصة</p>
          </div>
          <button
            onClick={() => {
              setSelectedFeature(null);
              setShowEditModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
            إضافة ميزة جديدة
          </button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">إجمالي الميزات</p>
                <p className="text-2xl font-bold text-gray-800">{features.length}</p>
              </div>
              <FaCog className="text-3xl text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">المفعلة</p>
                <p className="text-2xl font-bold text-green-600">
                  {features.filter(f => f.enabled).length}
                </p>
              </div>
              <FaCheckCircle className="text-3xl text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">المعطلة</p>
                <p className="text-2xl font-bold text-red-600">
                  {features.filter(f => !f.enabled).length}
                </p>
              </div>
              <FaTimesCircle className="text-3xl text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Overrides</p>
                <p className="text-2xl font-bold text-purple-600">{overrides.length}</p>
              </div>
              <FaLock className="text-3xl text-purple-600" />
            </div>
          </div>
        </div>

        {/* الفلاتر */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البحث
              </label>
              <div className="relative">
                <FaSearch className="absolute right-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 border rounded-lg pr-10"
                  placeholder="ابحث في الميزات..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الفئة
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="all">الكل</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحالة
              </label>
              <select
                value={filterEnabled}
                onChange={(e) => setFilterEnabled(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="all">الكل</option>
                <option value="enabled">مفعلة</option>
                <option value="disabled">معطلة</option>
              </select>
            </div>
          </div>
        </div>

        {/* قائمة الميزات */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الميزة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الفئة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    النطاق
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإحصائيات
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFeatures.map((feature) => {
                  const featureStats = stats[feature.id];
                  return (
                    <tr key={feature.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {feature.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {feature.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {feature.metadata?.category || 'عام'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {feature.scope === 'global' && <FaGlobe className="inline ml-2" />}
                        {feature.scope === 'role' && <FaUsers className="inline ml-2" />}
                        {feature.scope === 'user' && <FaUsers className="inline ml-2" />}
                        {feature.scope === 'property' && <FaBuilding className="inline ml-2" />}
                        {feature.scope}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleFeature(feature)}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            feature.enabled
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {feature.enabled ? (
                            <>
                              <FaToggleOn className="text-lg" />
                              مفعلة
                            </>
                          ) : (
                            <>
                              <FaToggleOff className="text-lg" />
                              معطلة
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {featureStats ? (
                          <div className="flex items-center gap-2">
                            <FaChartLine />
                            <span>{featureStats.totalUsage || 0} استخدام</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedFeature(feature);
                              setShowEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="تعديل"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedFeature(feature);
                              setShowOverrideModal(true);
                            }}
                            className="text-purple-600 hover:text-purple-900"
                            title="إضافة Override"
                          >
                            <FaLock />
                          </button>
                          <button
                            onClick={() => handleDeleteFeature(feature.id)}
                            className="text-red-600 hover:text-red-900"
                            title="حذف"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal التعديل */}
        {showEditModal && (
          <FeatureEditModal
            feature={selectedFeature}
            onClose={() => {
              setShowEditModal(false);
              setSelectedFeature(null);
            }}
            onSave={() => {
              setShowEditModal(false);
              setSelectedFeature(null);
              loadData();
            }}
          />
        )}

        {/* Modal Override */}
        {showOverrideModal && selectedFeature && (
          <FeatureOverrideModal
            feature={selectedFeature}
            onClose={() => {
              setShowOverrideModal(false);
              setSelectedFeature(null);
            }}
            onSave={() => {
              setShowOverrideModal(false);
              setSelectedFeature(null);
              loadData();
            }}
          />
        )}
      </div>
    </div>
  );
}

// Modal تعديل الميزة
function FeatureEditModal({
  feature,
  onClose,
  onSave,
}: {
  feature: FeatureConfig | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState<Partial<FeatureConfig>>(
    feature || {
      id: '' as FeatureId,
      name: '',
      description: '',
      enabled: true,
      scope: 'global',
      metadata: {},
    }
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const method = feature ? 'PUT' : 'POST';
      const response = await fetch('/api/features', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          updatedBy: 'admin', // TODO: استخدام المستخدم الحالي
        }),
      });

      if (response.ok) {
        onSave();
      } else {
        throw new Error('Failed to save feature');
      }
    } catch (error) {
      console.error('Error saving feature:', error);
      alert('حدث خطأ أثناء حفظ الميزة');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {feature ? 'تعديل الميزة' : 'إضافة ميزة جديدة'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimesCircle className="text-2xl" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                معرف الميزة
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value as FeatureId })}
                className="w-full p-2 border rounded-lg"
                required
                disabled={!!feature}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الاسم
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الوصف
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded-lg"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  النطاق
                </label>
                <select
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value as any })}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="global">عالمي</option>
                  <option value="role">حسب الدور</option>
                  <option value="user">حسب المستخدم</option>
                  <option value="property">حسب العقار</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الفئة
                </label>
                <input
                  type="text"
                  value={formData.metadata?.category || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    metadata: { ...formData.metadata, category: e.target.value },
                  })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="core, ai, marketing, etc."
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enabled"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
                مفعلة
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {saving ? 'جاري الحفظ...' : 'حفظ'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Modal Override
function FeatureOverrideModal({
  feature,
  onClose,
  onSave,
}: {
  feature: FeatureConfig;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    scope: 'user' as 'user' | 'role' | 'property',
    targetId: '',
    enabled: true,
    reason: '',
    expiresAt: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/features/overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          featureId: feature.id,
          ...formData,
          expiresAt: formData.expiresAt ? new Date(formData.expiresAt).getTime() : undefined,
          createdBy: 'admin', // TODO: استخدام المستخدم الحالي
        }),
      });

      if (response.ok) {
        onSave();
      } else {
        throw new Error('Failed to create override');
      }
    } catch (error) {
      console.error('Error creating override:', error);
      alert('حدث خطأ أثناء إنشاء Override');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              إضافة Override للميزة: {feature.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimesCircle className="text-2xl" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                النطاق
              </label>
              <select
                value={formData.scope}
                onChange={(e) => setFormData({ ...formData, scope: e.target.value as any })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="user">مستخدم</option>
                <option value="role">دور</option>
                <option value="property">عقار</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المعرف (User ID, Role, Property ID)
              </label>
              <input
                type="text"
                value={formData.targetId}
                onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="override-enabled"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="override-enabled" className="text-sm font-medium text-gray-700">
                مفعلة
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                السبب (اختياري)
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full p-2 border rounded-lg"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                تاريخ الانتهاء (اختياري)
              </label>
              <input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
              >
                {saving ? 'جاري الحفظ...' : 'حفظ Override'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
