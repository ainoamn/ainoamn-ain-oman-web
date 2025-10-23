import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  FiUsers, FiPackage, FiEdit, FiTrash2, FiPlus, FiCheck, FiX,
  FiDollarSign, FiClock, FiShield, FiSettings, FiCheckCircle, FiLock
} from 'react-icons/fi';
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/lib/subscriptionSystem';
import { FEATURE_PERMISSIONS, PLAN_FEATURES } from '@/lib/featurePermissions';

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  
  // الباقات
  const [plans, setPlans] = useState<SubscriptionPlan[]>([...SUBSCRIPTION_PLANS]);
  const [selectedPlan, setSelectedPlan] = useState<string>('basic');
  
  // المستخدمون
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    try {
      const authData = localStorage.getItem('ain_auth');
      if (authData) {
        const currentUser = JSON.parse(authData);
        setUsers([currentUser]);
      }
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  // تعيين باقة لمستخدم
  const assignPlanToUser = (userId: string, planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const subscription = {
      id: 'SUB-' + Date.now(),
      userId,
      planId,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active' as const,
      autoRenew: true,
      paymentMethod: 'admin_assign',
      lastPaymentDate: new Date().toISOString(),
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      totalPaid: plan.price,
      remainingDays: 30,
      usage: {
        properties: 0,
        units: 0,
        bookings: 0,
        users: 1,
        storage: 0
      },
      limits: {
        properties: plan.maxProperties,
        units: plan.maxUnits,
        bookings: plan.maxBookings,
        users: plan.maxUsers,
        storage: plan.storageGB
      }
    };

    // تحديث المستخدمين
    setUsers(users.map(u => u.id === userId ? { ...u, subscription } : u));

    // تحديث localStorage
    const authData = localStorage.getItem('ain_auth');
    if (authData) {
      const currentUser = JSON.parse(authData);
      if (currentUser.id === userId) {
        currentUser.subscription = subscription;
        localStorage.setItem('ain_auth', JSON.stringify(currentUser));
        
        // إطلاق حدث التحديث
        window.dispatchEvent(new Event('ain_auth:change'));
      }
    }

    alert('✅ تم تعيين الباقة بنجاح! سيتم تحديث الصلاحيات تلقائياً.');
  };

  // إلغاء الاشتراك
  const revokePlan = (userId: string) => {
    if (!confirm('⚠️ هل تريد إلغاء اشتراك هذا المستخدم؟')) return;

    setUsers(users.map(u => u.id === userId ? { ...u, subscription: null } : u));

    const authData = localStorage.getItem('ain_auth');
    if (authData) {
      const currentUser = JSON.parse(authData);
      if (currentUser.id === userId) {
        currentUser.subscription = null;
        localStorage.setItem('ain_auth', JSON.stringify(currentUser));
        window.dispatchEvent(new Event('ain_auth:change'));
      }
    }

    alert('✅ تم إلغاء الاشتراك');
  };

  // حفظ التعديلات على الباقة
  const saveEditedPlan = () => {
    if (!editingPlan) return;

    const updatedPlans = plans.map(p => 
      p.id === editingPlan.id ? editingPlan : p
    );
    setPlans(updatedPlans);
    setShowEditModal(false);
    alert('✅ تم حفظ التعديلات');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>إدارة الاشتراكات | Ain Oman</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">إدارة الاشتراكات والصلاحيات</h1>
                <p className="text-white/80">التحكم الكامل في الباقات وصلاحيات المستخدمين</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{plans.length}</div>
                <div className="text-white/80">باقات متاحة</div>
              </div>
            </div>
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">إجمالي الباقات</div>
                  <div className="text-2xl font-bold text-gray-900">{plans.length}</div>
                </div>
                <FiPackage className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">المستخدمون</div>
                  <div className="text-2xl font-bold text-gray-900">{users.length}</div>
                </div>
                <FiUsers className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">الصلاحيات</div>
                  <div className="text-2xl font-bold text-gray-900">{Object.keys(FEATURE_PERMISSIONS).length}</div>
                </div>
                <FiShield className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">الاشتراكات النشطة</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.subscription?.status === 'active').length}
                  </div>
                </div>
                <FiCheckCircle className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* القائمة اليسرى: الباقات */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiPackage className="w-5 h-5 text-green-600" />
                  الباقات المتاحة
                </h2>

                <div className="space-y-3">
                  {plans.map(plan => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`w-full text-right p-4 rounded-xl border-2 transition-all ${
                        selectedPlan === plan.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-gray-900">{plan.nameAr}</div>
                        <div className="text-green-600 font-bold">{plan.price} ر.ع</div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{plan.descriptionAr}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{plan.maxProperties} عقار</span>
                        <span>•</span>
                        <span>{plan.maxUsers} مستخدم</span>
                      </div>
                      {selectedPlan === plan.id && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPlan(plan);
                              setShowEditModal(true);
                            }}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                          >
                            <FiEdit className="w-4 h-4" />
                            تعديل الباقة
                          </button>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* المحتوى الأيمن: التفاصيل */}
            <div className="lg:col-span-2 space-y-6">
              {/* تفاصيل الباقة المختارة */}
              {selectedPlan && (() => {
                const plan = plans.find(p => p.id === selectedPlan);
                if (!plan) return null;

                return (
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">{plan.nameAr}</h2>
                      <span className={`px-4 py-2 rounded-full text-white font-bold ${plan.color}`}>
                        {plan.price} ر.ع/{plan.duration === 'monthly' ? 'شهر' : 'سنة'}
                      </span>
                    </div>

                    {/* المعلومات الأساسية */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">الأولوية</div>
                        <div className="font-bold text-gray-900 capitalize">{plan.priority}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">المدة</div>
                        <div className="font-bold text-gray-900">
                          {plan.duration === 'monthly' ? 'شهري' : 'سنوي'}
                        </div>
                      </div>
                    </div>

                    {/* الحدود */}
                    <div className="mb-6">
                      <h3 className="font-bold text-gray-900 mb-3">الحدود:</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <span className="text-sm text-gray-700">العقارات</span>
                          <span className="font-bold text-blue-600">{plan.maxProperties}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="text-sm text-gray-700">الوحدات</span>
                          <span className="font-bold text-green-600">{plan.maxUnits}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <span className="text-sm text-gray-700">الحجوزات</span>
                          <span className="font-bold text-purple-600">{plan.maxBookings}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <span className="text-sm text-gray-700">المستخدمون</span>
                          <span className="font-bold text-orange-600">{plan.maxUsers}</span>
                        </div>
                      </div>
                    </div>

                    {/* الصلاحيات */}
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <FiShield className="w-5 h-5 text-green-600" />
                        الصلاحيات ({PLAN_FEATURES[plan.id]?.length || 0}):
                      </h3>
                      <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                        {PLAN_FEATURES[plan.id]?.map(featureId => {
                          const feature = FEATURE_PERMISSIONS[featureId];
                          if (!feature) return null;
                          
                          return (
                            <div
                              key={featureId}
                              className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                            >
                              <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{feature.nameAr}</div>
                                <div className="text-xs text-gray-600">{feature.descriptionAr}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* المستخدمون */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiUsers className="w-5 h-5 text-green-600" />
                  المستخدمون
                </h2>

                <div className="space-y-3">
                  {users.map(user => (
                    <div key={user.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-bold text-gray-900">{user.name || 'مستخدم'}</div>
                          <div className="text-sm text-gray-600">{user.email || user.phone}</div>
                        </div>
                        {user.subscription ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            {plans.find(p => p.id === user.subscription.planId)?.nameAr || 'مشترك'}
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                            بدون اشتراك
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <select
                          onChange={(e) => assignPlanToUser(user.id, e.target.value)}
                          defaultValue=""
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="" disabled>اختر باقة...</option>
                          {plans.map(plan => (
                            <option key={plan.id} value={plan.id}>
                              {plan.nameAr} - {plan.price} ر.ع
                            </option>
                          ))}
                        </select>
                        
                        {user.subscription && (
                          <button
                            onClick={() => revokePlan(user.id)}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <FiX className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: تعديل الباقة */}
      {showEditModal && editingPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">تعديل الباقة: {editingPlan.nameAr}</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* الاسم */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الاسم بالعربية</label>
                  <input
                    type="text"
                    value={editingPlan.nameAr}
                    onChange={(e) => setEditingPlan({...editingPlan, nameAr: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الاسم بالإنجليزية</label>
                  <input
                    type="text"
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* السعر والمدة */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">السعر (ر.ع)</label>
                  <input
                    type="number"
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({...editingPlan, price: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المدة</label>
                  <select
                    value={editingPlan.duration}
                    onChange={(e) => setEditingPlan({...editingPlan, duration: e.target.value as 'monthly' | 'yearly'})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="monthly">شهري</option>
                    <option value="yearly">سنوي</option>
                  </select>
                </div>
              </div>

              {/* الحدود */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">عدد العقارات</label>
                  <input
                    type="number"
                    value={editingPlan.maxProperties}
                    onChange={(e) => setEditingPlan({...editingPlan, maxProperties: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">عدد الوحدات</label>
                  <input
                    type="number"
                    value={editingPlan.maxUnits}
                    onChange={(e) => setEditingPlan({...editingPlan, maxUnits: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">عدد الحجوزات</label>
                  <input
                    type="number"
                    value={editingPlan.maxBookings}
                    onChange={(e) => setEditingPlan({...editingPlan, maxBookings: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">عدد المستخدمين</label>
                  <input
                    type="number"
                    value={editingPlan.maxUsers}
                    onChange={(e) => setEditingPlan({...editingPlan, maxUsers: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* الأزرار */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={saveEditedPlan}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-blue-700 transition-all shadow-lg"
                >
                  حفظ التعديلات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

