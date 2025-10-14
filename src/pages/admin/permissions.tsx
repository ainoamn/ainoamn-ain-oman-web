// src/pages/admin/permissions.tsx
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  FiShield, FiUser, FiCheck, FiX, FiEdit, FiSave, FiSearch,
  FiFilter, FiAlertCircle, FiPackage, FiSettings
} from 'react-icons/fi';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  ALL_PERMISSIONS, 
  ROLE_DEFAULT_PERMISSIONS,
  getUserPermissions 
} from '@/lib/permissions';

interface UserPermissionSetting {
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  customPermissions: string[];
  subscription: {
    plan: string;
    expiresAt: string;
  } | null;
}

export default function PermissionsManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [canEdit, setCanEdit] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // التحقق من صلاحيات المستخدم الحالي
    const authData = localStorage.getItem('ain_auth');
    if (authData) {
      const userData = JSON.parse(authData);
      setCurrentUser(userData);
      const hasEditPermission = userData.permissions?.includes('*') || 
                                userData.permissions?.includes('manage_users');
      setCanEdit(hasEditPermission);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditingPermissions(user.permissions || []);
  };

  const togglePermission = (permissionId: string) => {
    if (editingPermissions.includes(permissionId)) {
      setEditingPermissions(editingPermissions.filter(p => p !== permissionId));
    } else {
      setEditingPermissions([...editingPermissions, permissionId]);
    }
  };

  const savePermissions = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch('/api/users/permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          permissions: editingPermissions
        })
      });

      if (response.ok) {
        alert('تم حفظ الصلاحيات بنجاح!');
        setSelectedUser(null);
        loadUsers();
      }
    } catch (error) {
      console.error('Error saving permissions:', error);
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  const filteredPermissions = ALL_PERMISSIONS.filter(perm => {
    const matchesSearch = perm.name.ar.includes(searchTerm) || perm.name.en.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || perm.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Head>
        <title>إدارة الصلاحيات - Ain Oman</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 mb-8 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">إدارة الصلاحيات</h1>
                <p className="text-blue-100">
                  {canEdit 
                    ? 'تحكم كامل في صلاحيات المستخدمين والباقات' 
                    : 'عرض صلاحيات المستخدمين (وضع القراءة فقط)'}
                </p>
              </div>
              <FiShield className="w-16 h-16 opacity-50" />
            </div>
          </div>

          {/* Access Notice for Non-Admins */}
          {!canEdit && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-yellow-900 mb-2">وضع المشاهدة فقط</h3>
                  <p className="text-yellow-800">
                    أنت تعرض هذه الصفحة في وضع القراءة فقط. لتعديل صلاحيات المستخدمين، يجب أن تكون لديك صلاحية 
                    <span className="font-mono bg-yellow-100 px-2 py-1 rounded mx-1">manage_users</span>
                    أو أن تكون مدير النظام.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">إجمالي المستخدمين</p>
                  <p className="text-3xl font-bold text-blue-600">{users.length}</p>
                </div>
                <FiUser className="w-10 h-10 text-blue-600 opacity-50" />
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
                  <p className="text-gray-600 text-sm">المشتركين</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {users.filter(u => u.subscription).length}
                  </p>
                </div>
                <FiSettings className="w-10 h-10 text-purple-600 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">الأدوار</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {Object.keys(ROLE_DEFAULT_PERMISSIONS).length}
                  </p>
                </div>
                <FiShield className="w-10 h-10 text-orange-600 opacity-50" />
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">المستخدمون والصلاحيات</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700">المستخدم</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700">الدور</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700">الباقة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700">الصلاحيات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => {
                    const allPermissions = getUserPermissions(
                      user.role,
                      user.subscription?.plan
                    );
                    const hasAllAccess = allPermissions.includes('*') || allPermissions.includes('all');

                    return (
                      <tr key={user.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.picture}
                              alt={user.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {user.subscription ? (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                              {user.subscription.plan}
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                              بدون باقة
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {hasAllAccess ? (
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-bold">
                              ✨ جميع الصلاحيات
                            </span>
                          ) : (
                            <span className="text-gray-600 text-sm">
                              {allPermissions.length} صلاحية
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {canEdit ? (
                            <button
                              onClick={() => handleEditUser(user)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <FiEdit className="w-4 h-4" />
                              تعديل
                            </button>
                          ) : (
                            <button
                              disabled
                              className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                              title="ليس لديك صلاحية التعديل"
                            >
                              <FiEdit className="w-4 h-4" />
                              عرض فقط
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit Modal */}
          {selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
                
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white sticky top-0 z-10">
                  <h2 className="text-2xl font-bold">تعديل صلاحيات: {selectedUser.name}</h2>
                  <p className="text-blue-100 text-sm mt-1">{selectedUser.email}</p>
                </div>

                {/* Current Info */}
                <div className="p-6 bg-blue-50 border-b border-blue-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">الدور:</p>
                      <p className="font-bold text-gray-900">{selectedUser.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">الباقة:</p>
                      <p className="font-bold text-gray-900">
                        {selectedUser.subscription?.plan || 'بدون باقة'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="p-6 border-b border-gray-200">
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
                  <p className="text-sm text-gray-600 mb-4">
                    الصلاحيات المحددة: <span className="font-bold text-blue-600">{editingPermissions.length}</span> / {ALL_PERMISSIONS.length}
                  </p>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredPermissions.map((permission) => {
                      const isChecked = editingPermissions.includes(permission.id);
                      const categoryColors: Record<string, string> = {
                        properties: 'bg-green-100 text-green-800',
                        financial: 'bg-blue-100 text-blue-800',
                        legal: 'bg-red-100 text-red-800',
                        maintenance: 'bg-orange-100 text-orange-800',
                        admin: 'bg-purple-100 text-purple-800',
                        reports: 'bg-indigo-100 text-indigo-800',
                        other: 'bg-gray-100 text-gray-800'
                      };

                      return (
                        <div
                          key={permission.id}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            canEdit ? 'cursor-pointer' : 'cursor-default'
                          } ${
                            isChecked 
                              ? 'bg-blue-50 border-blue-500' 
                              : 'bg-white border-gray-200 hover:border-blue-300'
                          }`}
                          onClick={() => canEdit && togglePermission(permission.id)}
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
                                <span className={`px-2 py-1 text-xs rounded-full ${categoryColors[permission.category]}`}>
                                  {permission.category}
                                </span>
                                {permission.requiredPlan && (
                                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
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
                    onClick={() => setSelectedUser(null)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                  >
                    {canEdit ? 'إلغاء' : 'إغلاق'}
                  </button>
                  {canEdit && (
                    <button
                      onClick={savePermissions}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all shadow-lg"
                    >
                      <FiSave className="w-5 h-5" />
                      حفظ الصلاحيات
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

