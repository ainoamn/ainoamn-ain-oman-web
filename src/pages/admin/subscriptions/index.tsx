// src/pages/admin/subscriptions/index.tsx - إدارة الباقات والصلاحيات المتقدمة
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  FiUsers, FiPackage, FiEdit, FiTrash2, FiPlus, FiCheck, FiX, FiSave,
  FiDollarSign, FiClock, FiTrendingUp, FiAlertCircle, FiShield, FiSettings,
  FiCheckCircle
} from 'react-icons/fi';
import { 
  SUBSCRIPTION_PLANS, 
  subscriptionManager,
  type SubscriptionPlan 
} from '@/lib/subscriptionSystem';
import { FEATURE_PERMISSIONS } from '@/lib/permissionConfig';

export default function AdminSubscriptionsManagement() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([...SUBSCRIPTION_PLANS]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // New plan form
  const [newPlan, setNewPlan] = useState<Partial<SubscriptionPlan>>({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    price: 0,
    currency: 'OMR',
    duration: 'monthly',
    maxProperties: 0,
    maxUnits: 0,
    maxBookings: 0,
    maxUsers: 1,
    storageGB: 1,
    priority: 'basic',
    color: 'bg-blue-500',
    features: [],
    featuresAr: [],
    permissions: []
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const authData = localStorage.getItem('ain_auth');
      if (authData) {
        const currentUser = JSON.parse(authData);
        setUsers([currentUser]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignSubscription = (userId: string, planId: string) => {
    try {
      const subscription = subscriptionManager.createSubscription(userId, planId, 'admin_assign');
      
      setUsers(users.map(u => u.id === userId ? { ...u, subscription } : u));

      const authData = localStorage.getItem('ain_auth');
      if (authData) {
        const currentUser = JSON.parse(authData);
        if (currentUser.id === userId) {
          currentUser.subscription = subscription;
          localStorage.setItem('ain_auth', JSON.stringify(currentUser));
        }
      }

      alert('✅ تم تعيين الاشتراك بنجاح!');
      setShowAssignModal(false);
      setSelectedUser(null);
    } catch (error) {
      alert('❌ حدث خطأ في تعيين الاشتراك');
    }
  };

  const revokeSubscription = (userId: string) => {
    if (!confirm('⚠️ هل أنت متأكد من إلغاء الاشتراك؟')) return;

    setUsers(users.map(u => u.id === userId ? { ...u, subscription: null } : u));

    const authData = localStorage.getItem('ain_auth');
    if (authData) {
      const currentUser = JSON.parse(authData);
      if (currentUser.id === userId) {
        currentUser.subscription = null;
        localStorage.setItem('ain_auth', JSON.stringify(currentUser));
      }
    }

    alert('✅ تم إلغاء الاشتراك');
  };

  const savePlanChanges = () => {
    // حفظ التغييرات في plans
    alert('✅ تم حفظ التغييرات');
    setShowEditPlanModal(false);
  };

  const addNewPlan = () => {
    if (!newPlan.name || !newPlan.nameAr) {
      alert('يرجى إدخال اسم الباقة');
      return;
    }

    const plan: SubscriptionPlan = {
      id: newPlan.name!.toLowerCase().replace(/\s+/g, '-'),
      name: newPlan.name!,
      nameAr: newPlan.nameAr!,
      description: newPlan.description || '',
      descriptionAr: newPlan.descriptionAr || '',
      price: newPlan.price || 0,
      currency: newPlan.currency || 'OMR',
      duration: newPlan.duration || 'monthly',
      features: newPlan.features || [],
      featuresAr: newPlan.featuresAr || [],
      permissions: newPlan.permissions || [],
      maxProperties: newPlan.maxProperties || 0,
      maxUnits: newPlan.maxUnits || 0,
      maxBookings: newPlan.maxBookings || 0,
      maxUsers: newPlan.maxUsers || 1,
      storageGB: newPlan.storageGB || 1,
      priority: newPlan.priority || 'basic',
      color: newPlan.color || 'bg-blue-500'
    };

    setPlans([...plans, plan]);
    setShowNewPlanModal(false);
    alert('✅ تم إضافة الباقة الجديدة');
  };

  const deletePlan = (planId: string) => {
    if (!confirm('⚠️ هل أنت متأكد من حذف هذه الباقة؟')) return;
    setPlans(plans.filter(p => p.id !== planId));
    alert('✅ تم حذف الباقة');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-OM', {
      style: 'currency',
      currency: 'OMR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Head>
        <title>إدارة الباقات والاشتراكات - عين عُمان</title>
      </Head>

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border-2 border-white/30">
                  <FiShield className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">مركز التحكم في الاشتراكات</h1>
                  <p className="text-lg opacity-90 mt-1">إدارة شاملة للباقات والصلاحيات والمستخدمين</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-xl transition-all border border-white/30"
              >
                ← لوحة الإدارة
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">إجمالي الباقات</p>
                <p className="text-3xl font-bold text-gray-900">{plans.length}</p>
              </div>
              <FiPackage className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">المستخدمون</p>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              </div>
              <FiUsers className="w-10 h-10 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">اشتراكات نشطة</p>
                <p className="text-3xl font-bold text-gray-900">
                  {users.filter(u => u.subscription?.status === 'active').length}
                </p>
              </div>
              <FiCheckCircle className="w-10 h-10 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
        <div className="flex items-center justify-between">
          <div>
                <p className="text-sm text-gray-600 mb-1">الإيرادات الشهرية</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    users.filter(u => u.subscription?.status === 'active')
                      .reduce((sum, u) => sum + (u.subscription?.price || 0), 0)
                  )}
                </p>
              </div>
              <FiDollarSign className="w-10 h-10 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Plans Management */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <FiPackage className="w-8 h-8 text-blue-600" />
                إدارة الباقات
              </h2>
              <p className="text-gray-600">تحكم كامل في الباقات وصلاحياتها</p>
            </div>
            <button
              onClick={() => setShowNewPlanModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl transform hover:scale-105 transition-all font-bold"
            >
              <FiPlus className="inline-block w-5 h-5 ml-2" />
              إضافة باقة جديدة
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className="border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-400 transition-all bg-gradient-to-br from-white to-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${plan.color} rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
                      {plan.nameAr.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{plan.nameAr}</h3>
                      <p className="text-sm text-gray-600">{plan.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedPlan(plan);
                        setShowEditPlanModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="تعديل"
                    >
                      <FiEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deletePlan(plan.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">{formatCurrency(plan.price)}</span>
                    <span className="text-gray-600">/ {plan.duration === 'monthly' ? 'شهر' : 'سنة'}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{plan.descriptionAr}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {plan.maxProperties === -1 ? '∞' : plan.maxProperties}
                    </div>
                    <div className="text-xs text-gray-600">عقار</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {plan.maxBookings === -1 ? '∞' : plan.maxBookings}
                    </div>
                    <div className="text-xs text-gray-600">حجز</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {plan.maxUsers === -1 ? '∞' : plan.maxUsers}
                    </div>
                    <div className="text-xs text-gray-600">مستخدم</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-orange-600">{plan.storageGB}</div>
                    <div className="text-xs text-gray-600">GB</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm font-semibold text-gray-900 mb-2">
                    🔐 الصلاحيات ({plan.permissions.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {plan.permissions.slice(0, 6).map((perm, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          perm.level === 'admin' ? 'bg-red-100 text-red-800' :
                          perm.level === 'write' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {perm.nameAr}
                      </span>
                    ))}
                    {plan.permissions.length > 6 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{plan.permissions.length - 6}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Users Management */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <FiUsers className="w-8 h-8 text-green-600" />
                إدارة المستخدمين
              </h2>
              <p className="text-gray-600">تعيين وإدارة اشتراكات المستخدمين</p>
            </div>
            <button
              onClick={() => router.push('/subscriptions')}
              className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
            >
              عرض صفحة الاشتراك العامة
            </button>
          </div>

          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">المستخدم</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الدور</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الباقة</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الحالة</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الاستخدام</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">المتبقي</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-bold text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email || user.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                          {user.role === 'admin' ? '🛡️ مدير' : 
                           user.role === 'landlord' ? '🏢 مالك' : 
                           user.role === 'tenant' ? '👤 مستأجر' : user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.subscription ? (
                          <div>
                            <div className="font-semibold text-gray-900">{user.subscription.planName}</div>
                            <div className="text-sm text-gray-600">{formatCurrency(user.subscription.price || 0)}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">لا يوجد</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.subscription ? (
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            user.subscription.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.subscription.status === 'active' ? '✓ نشط' : '✗ منتهي'}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.subscription?.usage ? (
                          <div className="text-xs space-y-1 font-medium">
                            <div className="text-blue-600">🏢 {user.subscription.usage.properties}/{user.subscription.limits.properties === -1 ? '∞' : user.subscription.limits.properties}</div>
                            <div className="text-green-600">📅 {user.subscription.usage.bookings}/{user.subscription.limits.bookings === -1 ? '∞' : user.subscription.limits.bookings}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.subscription ? (
                          <span className={`text-sm font-bold ${
                            user.subscription.remainingDays <= 7 ? 'text-red-600' : 
                            user.subscription.remainingDays <= 30 ? 'text-yellow-600' : 
                            'text-green-600'
                          }`}>
                            {user.subscription.remainingDays} يوم
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowAssignModal(true);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-md hover:shadow-lg transition-all"
                          >
                            <FiEdit className="inline-block w-4 h-4 ml-1" />
                            تعيين
                          </button>
                          {user.subscription && (
                            <button
                              onClick={() => revokeSubscription(user.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium shadow-md hover:shadow-lg transition-all"
                            >
                              <FiTrash2 className="inline-block w-4 h-4 ml-1" />
                              إلغاء
                            </button>
                          )}
                        </div>
                          </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <FiUsers className="mx-auto h-20 w-20 text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">لا يوجد مستخدمون</p>
            </div>
          )}
        </div>

        {/* Plans Details */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <FiSettings className="w-8 h-8 text-purple-600" />
            تفاصيل الباقات والصلاحيات
          </h2>
          
          <div className="space-y-8">
            {plans.map((plan, planIdx) => (
              <div key={plan.id} className={`border-2 rounded-2xl p-6 ${plan.popular ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200'}`}>
                {plan.popular && (
                  <div className="mb-4">
                    <span className="px-4 py-1 bg-blue-600 text-white rounded-full text-sm font-bold">⭐ الأكثر شعبية</span>
                  </div>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-3">📋 معلومات الباقة</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">المعرف:</span>
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{plan.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">السعر:</span>
                        <span className="font-bold text-gray-900">{formatCurrency(plan.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">المدة:</span>
                        <span className="font-medium">{plan.duration === 'monthly' ? 'شهري' : 'سنوي'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الأولوية:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          plan.priority === 'enterprise' ? 'bg-red-100 text-red-800' :
                          plan.priority === 'premium' ? 'bg-purple-100 text-purple-800' :
                          plan.priority === 'standard' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {plan.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-3">📊 الحدود</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">🏢 العقارات:</span>
                        <span className="font-bold">{plan.maxProperties === -1 ? '∞' : plan.maxProperties}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">🏠 الوحدات:</span>
                        <span className="font-bold">{plan.maxUnits === -1 ? '∞' : plan.maxUnits}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">📅 الحجوزات:</span>
                        <span className="font-bold">{plan.maxBookings === -1 ? '∞' : plan.maxBookings}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">👥 المستخدمون:</span>
                        <span className="font-bold">{plan.maxUsers === -1 ? '∞' : plan.maxUsers}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">💾 التخزين:</span>
                        <span className="font-bold">{plan.storageGB} GB</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-3">🔐 الصلاحيات ({plan.permissions.length})</h4>
                    <div className="max-h-48 overflow-y-auto space-y-1 text-sm">
                      {plan.permissions.map((perm, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                        >
                          <span className="text-gray-700">{perm.nameAr}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            perm.level === 'admin' ? 'bg-red-100 text-red-800' :
                            perm.level === 'write' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {perm.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              تعيين باقة لـ {selectedUser.name}
            </h3>
            <p className="text-gray-600 mb-8">اختر الباقة المناسبة للمستخدم</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {plans.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                        return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id as any)}
                    className={`text-right p-6 rounded-2xl border-3 transition-all transform ${
                      isSelected
                        ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-purple-50 shadow-2xl scale-105'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-xl hover:scale-102'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${plan.color} rounded-xl flex items-center justify-center text-white font-bold text-xl`}>
                        {plan.nameAr.charAt(0)}
                      </div>
                      {isSelected && (
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <FiCheck className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-xl text-gray-900 mb-2">{plan.nameAr}</div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">{formatCurrency(plan.price)}</div>
                    <div className="text-sm text-gray-600 mb-4">{plan.descriptionAr}</div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {plan.maxProperties === -1 ? '∞' : plan.maxProperties} عقار
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        {plan.maxBookings === -1 ? '∞' : plan.maxBookings} حجز
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                        {plan.permissions.length} صلاحية
                      </span>
                    </div>
                  </button>
                        );
                      })}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedUser(null);
                  setSelectedPlan(null);
                }}
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold text-lg transition-all"
              >
                <FiX className="inline-block w-5 h-5 ml-2" />
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (selectedPlan) {
                    assignSubscription(selectedUser.id, selectedPlan as any);
                  } else {
                    alert('⚠️ يرجى اختيار باقة');
                  }
                }}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-2xl font-bold text-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedPlan}
              >
                <FiCheck className="inline-block w-5 h-5 ml-2" />
                تعيين الباقة
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
  );
}
