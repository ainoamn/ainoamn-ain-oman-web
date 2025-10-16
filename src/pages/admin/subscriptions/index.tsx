import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  FiUsers, FiPackage, FiSave, FiCheck, FiX, FiShield, FiSettings, FiCheckCircle,
  FiPlus, FiEdit, FiTrash2, FiList
} from 'react-icons/fi';
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/lib/subscriptionSystem';
import { FEATURE_PERMISSIONS, PLAN_FEATURES } from '@/lib/featurePermissions';

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  
  // الباقات
  const [plans, setPlans] = useState<SubscriptionPlan[]>([...SUBSCRIPTION_PLANS]);
  
  // الصلاحيات لكل باقة
  const [plansConfig, setPlansConfig] = useState<Record<string, string[]>>({
    basic: [...(PLAN_FEATURES.basic || [])],
    standard: [...(PLAN_FEATURES.standard || [])],
    premium: [...(PLAN_FEATURES.premium || [])],
    enterprise: [...(PLAN_FEATURES.enterprise || [])]
  });
  
  // المستخدمون
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [showEditFeaturesModal, setShowEditFeaturesModal] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string>('');
  const [editingFeatures, setEditingFeatures] = useState<string[]>([]);
  const [editingFeaturesAr, setEditingFeaturesAr] = useState<string[]>([]);

  // جميع الصلاحيات المتاحة
  const allFeatures = Object.keys(FEATURE_PERMISSIONS);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      // 1. تحميل الباقات من localStorage
      const customPlansStr = localStorage.getItem('custom_plans');
      if (customPlansStr) {
        const customPlans = JSON.parse(customPlansStr);
        setPlans(customPlans);

      } else {

      }

      // 2. تحميل الصلاحيات من localStorage
      const customFeaturesStr = localStorage.getItem('custom_plan_features');
      if (customFeaturesStr) {
        const customFeatures = JSON.parse(customFeaturesStr);
        setPlansConfig(customFeatures);
        console.log('✅ تم تحميل الصلاحيات من localStorage:', Object.keys(customFeatures).length);
      } else {

      }

      // 3. تحميل المستخدمين
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

  // تبديل صلاحية
  const toggleFeature = (planId: string, featureId: string) => {
    setPlansConfig(prev => {
      const planFeatures = prev[planId] || [];
      const hasFeature = planFeatures.includes(featureId);
      
      return {
        ...prev,
        [planId]: hasFeature
          ? planFeatures.filter(f => f !== featureId)
          : [...planFeatures, featureId]
      };
    });
  };

  const hasFeature = (planId: string, featureId: string): boolean => {
    return plansConfig[planId]?.includes(featureId) || false;
  };

  // تحديد/إلغاء تحديد جميع الصلاحيات لباقة
  const toggleAllFeatures = (planId: string) => {
    const currentFeatures = plansConfig[planId] || [];
    
    // إذا كانت جميع الصلاحيات محددة، ألغِ الكل
    if (currentFeatures.length === allFeatures.length) {
      setPlansConfig({
        ...plansConfig,
        [planId]: []
      });
    } else {
      // وإلا، حدد الكل
      setPlansConfig({
        ...plansConfig,
        [planId]: [...allFeatures]
      });
    }
  };

  // التحقق إذا كانت جميع الصلاحيات محددة
  const areAllFeaturesSelected = (planId: string): boolean => {
    const planFeatures = plansConfig[planId] || [];
    return planFeatures.length === allFeatures.length;
  };

  // حفظ التغييرات
  const saveChanges = () => {
    // حفظ في localStorage
    localStorage.setItem('custom_plans', JSON.stringify(plans));
    localStorage.setItem('custom_plan_features', JSON.stringify(plansConfig));
    
    // إطلاق حدث التحديث
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('ain_auth:change'));
    window.dispatchEvent(new CustomEvent('plans_updated', { detail: { plans, features: plansConfig } }));
    

    alert('✅ تم حفظ جميع التغييرات بنجاح!');
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
      usage: { properties: 0, units: 0, bookings: 0, users: 1, storage: 0 },
      limits: {
        properties: plan.maxProperties,
        units: plan.maxUnits,
        bookings: plan.maxBookings,
        users: plan.maxUsers,
        storage: plan.storageGB
      }
    };

    setUsers(users.map(u => u.id === userId ? { ...u, subscription } : u));

    const authData = localStorage.getItem('ain_auth');
    if (authData) {
      const currentUser = JSON.parse(authData);
      if (currentUser.id === userId) {
        currentUser.subscription = subscription;
        localStorage.setItem('ain_auth', JSON.stringify(currentUser));
        window.dispatchEvent(new Event('ain_auth:change'));
      }
    }

    alert('✅ تم تعيين الباقة بنجاح!');
  };

  // تعديل حدود الباقة
  const updatePlanLimit = (planId: string, field: keyof SubscriptionPlan, value: any) => {
    setPlans(plans.map(p => 
      p.id === planId ? { ...p, [field]: value } : p
    ));
  };

  // فتح modal تعديل الميزات
  const openEditFeaturesModal = (plan: SubscriptionPlan) => {
    setEditingPlanId(plan.id);
    setEditingFeatures([...(plan.features || [])]);
    setEditingFeaturesAr([...(plan.featuresAr || [])]);
    setShowEditFeaturesModal(true);
  };

  // إضافة ميزة جديدة
  const addFeature = () => {
    setEditingFeatures([...editingFeatures, '']);
    setEditingFeaturesAr([...editingFeaturesAr, '']);
  };

  // حذف ميزة
  const removeFeature = (index: number) => {
    setEditingFeatures(editingFeatures.filter((_, i) => i !== index));
    setEditingFeaturesAr(editingFeaturesAr.filter((_, i) => i !== index));
  };

  // حفظ الميزات
  const saveFeaturesChanges = () => {
    setPlans(plans.map(p => 
      p.id === editingPlanId 
        ? { 
            ...p, 
            features: editingFeatures.filter(f => f.trim() !== ''),
            featuresAr: editingFeaturesAr.filter(f => f.trim() !== '')
          }
        : p
    ));
    setShowEditFeaturesModal(false);
    alert('✅ تم حفظ الميزات! لا تنسَ "حفظ جميع التغييرات"');
  };

  // فتح modal تعديل الباقة
  const openEditModal = (plan: SubscriptionPlan) => {
    setEditingPlan({ ...plan });
    setShowEditPlanModal(true);
  };

  // حفظ تعديلات الباقة
  const saveEditedPlan = () => {
    if (!editingPlan) return;

    setPlans(plans.map(p => 
      p.id === editingPlan.id ? editingPlan : p
    ));

    setShowEditPlanModal(false);
    setEditingPlan(null);
    alert('✅ تم حفظ التعديلات! لا تنسَ "حفظ جميع التغييرات"');
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
        <title>إدارة الاشتراكات والصلاحيات | Ain Oman</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-[1800px] mx-auto px-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">إدارة الاشتراكات والصلاحيات</h1>
                <p className="text-white/80">التحكم الكامل في الباقات، الميزات، والصلاحيات</p>
              </div>
              <button
                onClick={saveChanges}
                className="bg-white text-green-600 px-6 py-3 rounded-xl font-bold hover:bg-green-50 transition-all shadow-lg flex items-center gap-2"
              >
                <FiSave className="w-5 h-5" />
                حفظ جميع التغييرات
              </button>
            </div>
          </div>

          {/* إحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">الباقات</div>
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
                  <div className="text-2xl font-bold text-gray-900">{allFeatures.length}</div>
                </div>
                <FiShield className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
        <div className="flex items-center justify-between">
          <div>
                  <div className="text-sm text-gray-600 mb-1">النشطة</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.subscription?.status === 'active').length}
                  </div>
                </div>
                <FiCheckCircle className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* جدول الباقات */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FiSettings className="w-6 h-6" />
                تفاصيل الباقات
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map(plan => (
                  <div key={plan.id} className="border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-green-300 transition-all">
                    {/* رأس البطاقة */}
                    <div className={`${plan.color} p-4 text-white`}>
                      <div className="text-xl font-bold mb-1">{plan.nameAr}</div>
                      <div className="text-3xl font-extrabold">{plan.price} ر.ع</div>
                      <div className="text-sm opacity-90">
                        {plan.duration === 'monthly' ? 'شهرياً' : 'سنوياً'}
          </div>
        </div>

                    {/* المحتوى */}
                    <div className="p-4 space-y-4">
                      {/* الحدود */}
                      <div>
                        <div className="text-xs font-bold text-gray-500 mb-2">الحدود:</div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">العقارات:</span>
                            <input
                              type="number"
                              value={plan.maxProperties}
                              onChange={(e) => updatePlanLimit(plan.id, 'maxProperties', Number(e.target.value))}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-xs"
                            />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">الوحدات:</span>
                            <input
                              type="number"
                              value={plan.maxUnits}
                              onChange={(e) => updatePlanLimit(plan.id, 'maxUnits', Number(e.target.value))}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-xs"
                            />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">الحجوزات:</span>
                            <input
                              type="number"
                              value={plan.maxBookings}
                              onChange={(e) => updatePlanLimit(plan.id, 'maxBookings', Number(e.target.value))}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-xs"
                            />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">المستخدمون:</span>
                            <input
                              type="number"
                              value={plan.maxUsers}
                              onChange={(e) => updatePlanLimit(plan.id, 'maxUsers', Number(e.target.value))}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-xs"
                            />
                          </div>
                        </div>
          </div>

                      {/* الميزات المعروضة */}
                      <div>
                        <div className="text-xs font-bold text-gray-500 mb-2">الميزات ({(plan.featuresAr || []).length}):</div>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {(plan.featuresAr || []).slice(0, 5).map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                              <FiCheck className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{feature}</span>
                            </div>
                          ))}
                          {(plan.featuresAr || []).length > 5 && (
                            <div className="text-xs text-gray-500">+{(plan.featuresAr || []).length - 5} أخرى</div>
                          )}
                        </div>
          </div>

                      {/* الصلاحيات */}
                      <div>
                        <div className="text-xs font-bold text-gray-500 mb-2">
                          الصلاحيات ({plansConfig[plan.id]?.length || 0}):
                        </div>
                        <div className="text-sm text-gray-600">
                          {plansConfig[plan.id]?.length || 0} من {allFeatures.length}
                        </div>
                      </div>

                      {/* الأزرار */}
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => openEditModal(plan)}
                          className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs font-bold flex items-center justify-center gap-1"
                        >
                          <FiEdit className="w-3 h-3" />
                          تعديل
                        </button>
                        <button
                          onClick={() => openEditFeaturesModal(plan)}
                          className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs font-bold flex items-center justify-center gap-1"
                        >
                          <FiList className="w-3 h-3" />
                          الميزات
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* جدول الصلاحيات */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FiShield className="w-6 h-6" />
                مصفوفة الصلاحيات ({allFeatures.length} صلاحية)
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 sticky right-0 bg-gray-50">
                      الصلاحية
                    </th>
                    {plans.map(plan => (
                      <th key={plan.id} className="px-6 py-4 text-center min-w-[150px]">
                        <div className={`inline-block px-3 py-1 rounded-lg text-white font-bold text-sm ${plan.color}`}>
                          {plan.nameAr}
                        </div>
                        <div className="mt-2">
                          <button
                            onClick={() => toggleAllFeatures(plan.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              areAllFeaturesSelected(plan.id)
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                            title={areAllFeaturesSelected(plan.id) ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                          >
                            {areAllFeaturesSelected(plan.id) ? (
                              <>
                                <FiX className="w-3 h-3 inline mr-1" />
                                إلغاء الكل
                              </>
                            ) : (
                              <>
                                <FiCheck className="w-3 h-3 inline mr-1" />
                                تحديد الكل
                              </>
                            )}
                          </button>
                          <div className="text-xs text-gray-600 mt-1">
                            {plansConfig[plan.id]?.length || 0}/{allFeatures.length}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allFeatures.map(featureId => {
                    const feature = FEATURE_PERMISSIONS[featureId];
                        return (
                      <tr key={featureId} className="hover:bg-gray-50">
                        <td className="px-6 py-3 sticky right-0 bg-white">
                          <div className="text-sm font-medium text-gray-900">{feature.nameAr}</div>
                          <div className="text-xs text-gray-500">{feature.descriptionAr}</div>
                        </td>
                        {plans.map(plan => (
                          <td key={plan.id} className="px-6 py-3 text-center">
                            <label className="inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={hasFeature(plan.id, featureId)}
                                onChange={() => toggleFeature(plan.id, featureId)}
                                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500 cursor-pointer"
                              />
                            </label>
                          </td>
                        ))}
                      </tr>
                        );
                      })}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-50 p-6 border-t-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {allFeatures.length} صلاحية • {plans.length} باقات = {allFeatures.length * plans.length} خيار
                </div>
                <button
                  onClick={saveChanges}
                  className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:from-green-700 hover:to-blue-700 transition-all shadow-lg flex items-center gap-2"
                >
                  <FiSave className="w-5 h-5" />
                  حفظ جميع التغييرات
                </button>
              </div>
            </div>
          </div>

          {/* إدارة المستخدمين */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FiUsers className="w-6 h-6 text-green-600" />
              تعيين الباقات للمستخدمين
            </h2>

            <div className="space-y-4">
              {users.map(user => (
                <div key={user.id} className="border-2 border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-bold text-lg text-gray-900">{user.name || 'مستخدم'}</div>
                      <div className="text-sm text-gray-600">{user.email || user.phone}</div>
                    </div>
                    {user.subscription && (
                      <div className="text-right">
                        <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                          ✓ {plans.find(p => p.id === user.subscription.planId)?.nameAr}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {plans.map(plan => (
                      <button
                        key={plan.id}
                        onClick={() => assignPlanToUser(user.id, plan.id)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          user.subscription?.planId === plan.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-xs font-bold text-gray-700 mb-1">{plan.nameAr}</div>
                        <div className="text-lg font-bold text-gray-900">{plan.price} ر.ع</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {plansConfig[plan.id]?.length || 0} صلاحية
                        </div>
                        {user.subscription?.planId === plan.id && (
                          <FiCheckCircle className="w-5 h-5 text-green-600 mx-auto mt-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: تعديل معلومات الباقة */}
      {showEditPlanModal && editingPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">تعديل: {editingPlan.nameAr}</h3>
                <button onClick={() => setShowEditPlanModal(false)} className="p-2 hover:bg-white/20 rounded-lg">
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">الاسم بالعربية</label>
                  <input
                    type="text"
                    value={editingPlan.nameAr}
                    onChange={(e) => setEditingPlan({...editingPlan, nameAr: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">الاسم بالإنجليزية</label>
                  <input
                    type="text"
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">السعر (ر.ع)</label>
                  <input
                    type="number"
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({...editingPlan, price: Number(e.target.value)})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">المدة</label>
                  <select
                    value={editingPlan.duration}
                    onChange={(e) => setEditingPlan({...editingPlan, duration: e.target.value as any})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monthly">شهري</option>
                    <option value="yearly">سنوي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">الأولوية</label>
                  <select
                    value={editingPlan.priority}
                    onChange={(e) => setEditingPlan({...editingPlan, priority: e.target.value as any})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="basic">أساسي</option>
                    <option value="standard">معياري</option>
                    <option value="premium">مميز</option>
                    <option value="enterprise">مؤسسي</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">اللون</label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { value: 'bg-blue-500', label: 'أزرق' },
                    { value: 'bg-green-500', label: 'أخضر' },
                    { value: 'bg-purple-500', label: 'بنفسجي' },
                    { value: 'bg-orange-500', label: 'برتقالي' },
                    { value: 'bg-red-500', label: 'أحمر' },
                    { value: 'bg-pink-500', label: 'وردي' },
                    { value: 'bg-yellow-500', label: 'أصفر' },
                    { value: 'bg-indigo-500', label: 'نيلي' },
                    { value: 'bg-teal-500', label: 'تركواز' },
                    { value: 'bg-cyan-500', label: 'سماوي' }
                  ].map(color => (
                    <button
                      key={color.value}
                      onClick={() => setEditingPlan({...editingPlan, color: color.value})}
                      className={`${color.value} p-3 rounded-lg text-white text-xs font-bold hover:opacity-80 ${
                        editingPlan.color === color.value ? 'ring-4 ring-gray-400' : ''
                      }`}
                    >
                      {color.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                <button
                  onClick={() => setShowEditPlanModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={saveEditedPlan}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 shadow-lg"
                >
                  حفظ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: تعديل الميزات */}
      {showEditFeaturesModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">
                  تعديل الميزات: {plans.find(p => p.id === editingPlanId)?.nameAr}
                </h3>
                <button onClick={() => setShowEditFeaturesModal(false)} className="p-2 hover:bg-white/20 rounded-lg">
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <button
                  onClick={addFeature}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-bold flex items-center gap-2"
                >
                  <FiPlus className="w-4 h-4" />
                  إضافة ميزة
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {editingFeaturesAr.map((featureAr, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={editingFeatures[idx] || ''}
                        onChange={(e) => {
                          const newFeatures = [...editingFeatures];
                          newFeatures[idx] = e.target.value;
                          setEditingFeatures(newFeatures);
                        }}
                        placeholder="بالإنجليزية"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div className="col-span-6">
                      <input
                        type="text"
                        value={featureAr}
                        onChange={(e) => {
                          const newFeaturesAr = [...editingFeaturesAr];
                          newFeaturesAr[idx] = e.target.value;
                          setEditingFeaturesAr(newFeaturesAr);
                        }}
                        placeholder="بالعربية"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div className="col-span-1">
                      <button
                        onClick={() => removeFeature(idx)}
                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
          </div>

              <div className="flex gap-3 mt-6 pt-6 border-t-2 border-gray-200">
                <button
                  onClick={() => setShowEditFeaturesModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={saveFeaturesChanges}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-blue-700 shadow-lg"
                >
                  حفظ الميزات
                </button>
              </div>
            </div>
        </div>
      </div>
      )}
    </>
  );
}
