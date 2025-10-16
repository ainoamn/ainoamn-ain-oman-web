// src/pages/admin/roles-permissions.tsx
// إدارة صلاحيات الأدوار (Roles) - ليس المستخدمين الأفراد
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  FiShield, FiUsers, FiCheck, FiX, FiSave, FiSearch,
  FiFilter, FiAlertCircle, FiPackage, FiSettings, FiLock
} from 'react-icons/fi';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ALL_PERMISSIONS } from '@/lib/permissions';

interface RoleConfig {
  id: string;
  name: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  permissions: string[];
  color: string;
  icon: string;
  isActive: boolean;
}

// الأدوار الافتراضية
const DEFAULT_ROLES: RoleConfig[] = [
  {
    id: 'company_admin',
    name: { ar: 'مدير الشركة', en: 'Company Admin' },
    description: { ar: 'صلاحيات كاملة لإدارة النظام', en: 'Full system administration' },
    permissions: ['*'],
    color: 'red',
    icon: '🏢',
    isActive: true
  },
  {
    id: 'property_owner',
    name: { ar: 'مالك عقار', en: 'Property Owner' },
    description: { ar: 'مالك عقار يدير عقاراته الخاصة', en: 'Property owner managing own properties' },
    permissions: ['view_properties', 'add_property', 'edit_property', 'manage_units', 'view_financial', 'create_invoice', 'edit_invoice', 'view_maintenance', 'create_maintenance', 'manage_tasks', 'view_basic_reports'],
    color: 'green',
    icon: '👑',
    isActive: true
  },
  {
    id: 'property_manager',
    name: { ar: 'مدير عقار', en: 'Property Manager' },
    description: { ar: 'مدير مفوض لإدارة عقارات الآخرين', en: 'Authorized manager for others properties' },
    permissions: ['view_properties', 'edit_property', 'manage_units', 'view_maintenance', 'create_maintenance', 'assign_maintenance', 'manage_tasks'],
    color: 'purple',
    icon: '🎯',
    isActive: true
  },
  {
    id: 'accountant',
    name: { ar: 'محاسب', en: 'Accountant' },
    description: { ar: 'مسؤول عن الحسابات والفواتير', en: 'Responsible for accounts and invoices' },
    permissions: ['view_financial', 'create_invoice', 'edit_invoice', 'delete_invoice', 'manage_checks', 'view_reports', 'view_advanced_reports', 'export_reports'],
    color: 'orange',
    icon: '💰',
    isActive: true
  },
  {
    id: 'legal_advisor',
    name: { ar: 'مستشار قانوني', en: 'Legal Advisor' },
    description: { ar: 'مختص بالقضايا القانونية', en: 'Legal cases specialist' },
    permissions: ['view_legal', 'create_legal_case', 'edit_legal_case'],
    color: 'red',
    icon: '⚖️',
    isActive: true
  },
  {
    id: 'sales_agent',
    name: { ar: 'مندوب مبيعات', en: 'Sales Agent' },
    description: { ar: 'مسؤول عن المبيعات والعقارات', en: 'Sales and properties representative' },
    permissions: ['view_properties', 'add_property', 'view_maintenance', 'manage_tasks'],
    color: 'cyan',
    icon: '📊',
    isActive: true
  },
  {
    id: 'maintenance_staff',
    name: { ar: 'فني صيانة', en: 'Maintenance Staff' },
    description: { ar: 'فني صيانة ينفذ المهام', en: 'Technician executing tasks' },
    permissions: ['view_maintenance', 'manage_tasks'],
    color: 'gray',
    icon: '🔧',
    isActive: true
  },
  {
    id: 'tenant',
    name: { ar: 'مستأجر', en: 'Tenant' },
    description: { ar: 'مستأجر وحدة سكنية', en: 'Unit tenant' },
    permissions: ['view_properties', 'view_maintenance', 'create_maintenance'],
    color: 'teal',
    icon: '👤',
    isActive: true
  },
  {
    id: 'investor',
    name: { ar: 'مستثمر', en: 'Investor' },
    description: { ar: 'مستثمر يتابع العقارات والتقارير', en: 'Investor tracking properties and reports' },
    permissions: ['view_properties', 'view_financial', 'view_reports', 'view_analytics'],
    color: 'pink',
    icon: '💼',
    isActive: true
  },
  {
    id: 'customer_viewer',
    name: { ar: 'عميل متصفح', en: 'Customer Viewer' },
    description: { ar: 'عميل يتصفح العقارات فقط', en: 'Customer browsing properties only' },
    permissions: ['view_properties'],
    color: 'gray',
    icon: '👁️',
    isActive: true
  }
];

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<RoleConfig[]>(DEFAULT_ROLES);
  const [selectedRole, setSelectedRole] = useState<RoleConfig | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    loadRolesConfig();
  }, []);

  const loadRolesConfig = async () => {
    // محاولة تحميل من API أولاً
    try {
      const response = await fetch('/api/roles/load');
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles);
        // حفظ في localStorage أيضاً
        localStorage.setItem('roles_permissions_config', JSON.stringify(data.roles));

        return;
      }
    } catch (error) {

    }
    
    // fallback إلى localStorage
    const savedConfig = localStorage.getItem('roles_permissions_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setRoles(config);

      } catch (error) {

        initializeDefaultRoles();
      }
    } else {

      initializeDefaultRoles();
    }
  };

  const initializeDefaultRoles = () => {
    localStorage.setItem('roles_permissions_config', JSON.stringify(DEFAULT_ROLES));
    setRoles(DEFAULT_ROLES);

    
    // إرسال إشعار للتبويبات الأخرى
    try {
      const channel = new BroadcastChannel('permissions_channel');
      channel.postMessage({ 
        type: 'PERMISSIONS_INITIALIZED',
        timestamp: Date.now() 
      });
      channel.close();
    } catch (error) {

    }
  };

  const handleEditRole = (role: RoleConfig) => {
    setSelectedRole(role);
    setEditingPermissions([...role.permissions]);
  };

  const togglePermission = (permissionId: string) => {
    if (editingPermissions.includes('*')) {
      // إذا كان لديه صلاحية الكل، لا يمكن التعديل
      return;
    }

    if (editingPermissions.includes(permissionId)) {
      setEditingPermissions(editingPermissions.filter(p => p !== permissionId));
    } else {
      setEditingPermissions([...editingPermissions, permissionId]);
    }
  };

  const saveRolePermissions = async () => {
    if (!selectedRole) return;

    const updatedRoles = roles.map(role => 
      role.id === selectedRole.id 
        ? { ...role, permissions: editingPermissions }
        : role
    );

    setRoles(updatedRoles);
    
    // حفظ في localStorage (للمتصفح الحالي)
    localStorage.setItem('roles_permissions_config', JSON.stringify(updatedRoles));
    
    // حفظ في API (للمتصفحات الأخرى)
    try {
      await fetch('/api/roles/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles: updatedRoles })
      });

    } catch (error) {

    }
    
    // إرسال إشعار للتبويبات الأخرى باستخدام BroadcastChannel
    try {
      const channel = new BroadcastChannel('permissions_channel');
      channel.postMessage({ 
        type: 'PERMISSIONS_UPDATED', 
        roleId: selectedRole.id,
        timestamp: Date.now() 
      });
      channel.close();

      
      // أيضاً إرسال CustomEvent للتبويب الحالي
      window.dispatchEvent(new CustomEvent('permissions:updated', { 
        detail: { roleId: selectedRole.id } 
      }));
    } catch (error) {

    }
    
    alert('✅ تم حفظ صلاحيات الدور بنجاح!\n\nسيتم تطبيقها على جميع المستخدمين والمتصفحات.');
    setSelectedRole(null);
  };

  const filteredPermissions = ALL_PERMISSIONS.filter(perm => {
    const matchesSearch = perm.name.ar.includes(searchTerm) || perm.name.en.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || perm.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      properties: 'bg-green-100 text-green-800 border-green-300',
      financial: 'bg-blue-100 text-blue-800 border-blue-300',
      legal: 'bg-red-100 text-red-800 border-red-300',
      maintenance: 'bg-orange-100 text-orange-800 border-orange-300',
      admin: 'bg-purple-100 text-purple-800 border-purple-300',
      reports: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      other: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[category] || colors.other;
  };

  return (
    <ProtectedRoute requiredPermission="manage_users">
      <Head>
        <title>إدارة صلاحيات الأدوار - Ain Oman</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 mb-8 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">إدارة صلاحيات الأدوار</h1>
                <p className="text-blue-100">تحكم في الصلاحيات حسب نوع الحساب - يُطبق على جميع المستخدمين من نفس النوع</p>
              </div>
              <FiShield className="w-16 h-16 opacity-50" />
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-yellow-900 mb-2">⚠️ ملاحظة مهمة</h3>
                <p className="text-yellow-800">
                  التعديلات هنا تُطبق على <strong>جميع المستخدمين</strong> من نفس نوع الحساب.
                  مثلاً: إذا أضفت صلاحية لـ "مالك عقار"، ستُطبق على جميع الملاك في النظام.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">أنواع الحسابات</p>
                  <p className="text-3xl font-bold text-blue-600">{roles.length}</p>
                </div>
                <FiUsers className="w-10 h-10 text-blue-600 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">الصلاحيات المتاحة</p>
                  <p className="text-3xl font-bold text-green-600">{ALL_PERMISSIONS.length}</p>
                </div>
                <FiPackage className="w-10 h-10 text-green-600 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">الأدوار النشطة</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {roles.filter(r => r.isActive).length}
                  </p>
                </div>
                <FiSettings className="w-10 h-10 text-purple-600 opacity-50" />
              </div>
            </div>
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => {
              const hasAllAccess = role.permissions.includes('*');
              
              return (
                <div
                  key={role.id}
                  className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200 hover:border-blue-400 transition-all hover:shadow-2xl"
                >
                  {/* Role Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{role.icon}</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{role.name.ar}</h3>
                        <p className="text-xs text-gray-500">{role.id}</p>
                      </div>
                    </div>
                    {role.isActive && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                        نشط
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4">{role.description.ar}</p>

                  {/* Permissions Count */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    {hasAllAccess ? (
                      <div className="flex items-center gap-2">
                        <FiShield className="w-5 h-5 text-purple-600" />
                        <span className="font-bold text-purple-600">✨ جميع الصلاحيات</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium">الصلاحيات:</span>
                        <span className="text-2xl font-bold text-blue-600">{role.permissions.length}</span>
                      </div>
                    )}
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleEditRole(role)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all shadow-lg"
                  >
                    <FiSettings className="w-5 h-5" />
                    تعديل الصلاحيات
                  </button>
                </div>
              );
            })}
          </div>

          {/* Edit Modal */}
          {selectedRole && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto">
                
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className="text-5xl">{selectedRole.icon}</div>
                    <div>
                      <h2 className="text-2xl font-bold">تعديل صلاحيات: {selectedRole.name.ar}</h2>
                      <p className="text-blue-100 text-sm mt-1">{selectedRole.description.ar}</p>
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="p-6 bg-red-50 border-b-2 border-red-200">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-red-900 mb-2">⚠️ تحذير</h3>
                      <p className="text-red-800">
                        التعديلات ستُطبق على <strong>جميع المستخدمين</strong> من نوع "{selectedRole.name.ar}".
                        تأكد من الصلاحيات قبل الحفظ.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiSearch className="inline w-4 h-4 ml-2" />
                        بحث
                      </label>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="ابحث عن صلاحية..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiFilter className="inline w-4 h-4 ml-2" />
                        تصنيف
                      </label>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">جميع التصنيفات</option>
                        <option value="properties">العقارات</option>
                        <option value="financial">المالية</option>
                        <option value="legal">القانونية</option>
                        <option value="maintenance">الصيانة</option>
                        <option value="admin">الإدارة</option>
                        <option value="reports">التقارير</option>
                        <option value="other">أخرى</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Permissions List */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-600">
                      الصلاحيات المحددة: <span className="font-bold text-blue-600">{editingPermissions.length}</span> / {ALL_PERMISSIONS.length}
                    </p>
                    {editingPermissions.includes('*') && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-bold">
                        ✨ جميع الصلاحيات
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredPermissions.map((permission) => {
                      const isChecked = editingPermissions.includes(permission.id) || editingPermissions.includes('*');
                      const isDisabled = editingPermissions.includes('*');

                      return (
                        <div
                          key={permission.id}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          } ${
                            isChecked 
                              ? 'bg-blue-50 border-blue-500' 
                              : 'bg-white border-gray-200 hover:border-blue-300'
                          }`}
                          onClick={() => !isDisabled && togglePermission(permission.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${
                                  isChecked 
                                    ? 'bg-blue-600 border-blue-600' 
                                    : 'bg-white border-gray-300'
                                }`}>
                                  {isChecked && <FiCheck className="w-4 h-4 text-white" />}
                                </div>
                                <h3 className="font-bold text-gray-900">{permission.name.ar}</h3>
                                <span className={`px-2 py-1 text-xs rounded-full border ${getCategoryColor(permission.category)}`}>
                                  {permission.category}
                                </span>
                                {permission.requiredPlan && (
                                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full border border-yellow-300">
                                    يتطلب: {permission.requiredPlan}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mr-9">{permission.description.ar}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between sticky bottom-0">
                  <button
                    onClick={() => setSelectedRole(null)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={saveRolePermissions}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all shadow-lg"
                  >
                    <FiSave className="w-5 h-5" />
                    حفظ وتطبيق على جميع المستخدمين
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}

