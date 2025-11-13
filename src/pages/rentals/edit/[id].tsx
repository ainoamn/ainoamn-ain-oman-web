// src/pages/rentals/edit/[id].tsx - صفحة تعديل العقد الإيجاري - عرض تفاعلي مع أزرار التعديل
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InstantLink from "@/components/InstantLink";
import { 
  FaFileContract, FaBuilding, FaUser, FaCalendarAlt, FaMoneyBillWave,
  FaArrowLeft, FaDownload, FaPrint, FaEdit, FaDollarSign,
  FaMapMarkerAlt, FaFileAlt, FaCheck, FaSave, FaTimes
} from "react-icons/fa";

const EditRentalContractPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [rental, setRental] = useState<any>(null);
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // صلاحيات المستخدم - للتحكم في ظهور أزرار التعديل
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    // محاكاة جلب بيانات المستخدم الحالي
    // في التطبيق الحقيقي، هذه البيانات تأتي من session/auth
    const user = {
      id: 'demo-user',
      role: 'admin', // admin, staff, owner, tenant
      name: 'مدير النظام'
    };
    setCurrentUser(user);
    
    // فقط المدخل/الإدارة يمكنهم التعديل
    const allowedRoles = ['admin', 'staff'];
    setCanEdit(allowedRoles.includes(user.role));
  }, []);

  useEffect(() => {
    if (id) {
      loadRentalDetails();
    }
  }, [id]);

  const loadRentalDetails = async () => {
    try {
      console.log(`🔍 جلب تفاصيل العقد: ${id}`);
      const rentalRes = await fetch(`/api/rentals/${id}`);
      if (rentalRes.ok) {
        const data = await rentalRes.json();
        const rentalData = data.rental || data;
        setRental(rentalData);
        setEditData(rentalData);
        
        if (data.property) {
          setProperty(data.property);
        } else if (rentalData.propertyId) {
          const propertyRes = await fetch(`/api/properties/${rentalData.propertyId}`);
          if (propertyRes.ok) {
            const propertyData = await propertyRes.json();
            setProperty(propertyData.property || propertyData);
          }
        }
      }
    } catch (error) {
      console.error('❌ خطأ في جلب تفاصيل العقد:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async (section: string) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/rentals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        const updatedData = await response.json();
        setRental(updatedData.rental || updatedData);
        setEditData(updatedData.rental || updatedData);
        setEditingSection(null);
        alert('✅ تم حفظ التعديلات بنجاح!');
      } else {
        alert('❌ فشل حفظ التعديلات');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('❌ حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    if (!confirm('هل تريد حفظ جميع التعديلات؟')) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/rentals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        const updatedData = await response.json();
        setRental(updatedData.rental || updatedData);
        setEditData(updatedData.rental || updatedData);
        setEditingSection(null);
        alert('✅ تم حفظ جميع التعديلات بنجاح!');
        router.push(`/contracts/rental/${id}`);
      } else {
        alert('❌ فشل حفظ التعديلات');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('❌ حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditData(rental);
    setEditingSection(null);
  };

  const EditButton = ({ section }: { section: string }) => {
    // فقط المدخل/الإدارة يمكنهم رؤية أزرار التعديل
    if (!canEdit) return null;
    
    return (
      <button
        onClick={() => setEditingSection(section)}
        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 text-sm transition-colors"
      >
        <FaEdit className="w-3 h-3" />
        تعديل
      </button>
    );
  };

  const SaveCancelButtons = ({ section }: { section: string }) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleSaveSection(section)}
        disabled={saving}
        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 text-sm transition-colors disabled:opacity-50"
      >
        <FaSave className="w-3 h-3" />
        {saving ? 'جاري الحفظ...' : 'حفظ'}
      </button>
      <button
        onClick={handleCancelEdit}
        disabled={saving}
        className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 text-sm transition-colors"
      >
        <FaTimes className="w-3 h-3" />
        إلغاء
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">العقد غير موجود</h1>
          <InstantLink href="/contracts/rental" className="px-4 py-2 bg-blue-600 text-white rounded-md">
            العودة للعقود
          </InstantLink>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>تعديل العقد #{rental.id} | Ain Oman</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <InstantLink
                  href={`/contracts/rental/${id}`}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <FaArrowLeft className="w-5 h-5" />
                </InstantLink>
                <div>
                  <h1 className="text-2xl font-bold">تعديل عقد الإيجار</h1>
                  <p className="text-blue-100">العقد #{rental.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {canEdit && (
                  <>
                    <button
                      onClick={() => setShowPreview(true)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <FaFileContract className="w-4 h-4" />
                      معاينة
                    </button>
                    <button
                      onClick={handleSaveAll}
                      disabled={saving}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <FaSave className="w-4 h-4" />
                      {saving ? 'جاري الحفظ...' : 'حفظ جميع التعديلات'}
                    </button>
                  </>
                )}
                <InstantLink
                  href={`/contracts/rental/${id}`}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2"
                >
                  <FaFileContract className="w-4 h-4" />
                  عرض العقد
                </InstantLink>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            
            {/* نوع العقد */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border-2 border-purple-300"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaFileContract className="text-purple-600" />
                  نوع العقد
                </h4>
                {editingSection !== 'contractType' && <EditButton section="contractType" />}
                {editingSection === 'contractType' && <SaveCancelButtons section="contractType" />}
              </div>
              
              {editingSection === 'contractType' ? (
                <select
                  value={editData.contractType}
                  onChange={(e) => setEditData({ ...editData, contractType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-lg"
                >
                  <option value="residential">🏠 عقد سكني</option>
                  <option value="commercial">🏢 عقد تجاري</option>
                </select>
              ) : (
                <p className="text-xl font-bold">
                  {rental.contractType === 'residential' ? '🏠 عقد سكني' : '🏢 عقد تجاري'}
                </p>
              )}
            </motion.div>

            {/* معلومات المستأجر */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-green-50 rounded-lg p-6 border-2 border-green-300"
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-bold text-green-900 flex items-center gap-2">
                  <FaUser className="w-5 h-5" />
                  معلومات المستأجر
                </h5>
                {editingSection !== 'tenant' && <EditButton section="tenant" />}
                {editingSection === 'tenant' && <SaveCancelButtons section="tenant" />}
              </div>
              
              {editingSection === 'tenant' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                    <input
                      type="text"
                      value={editData.tenantName || ''}
                      onChange={(e) => setEditData({ ...editData, tenantName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الهاتف</label>
                    <input
                      type="text"
                      value={editData.tenantPhone || ''}
                      onChange={(e) => setEditData({ ...editData, tenantPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">البريد</label>
                    <input
                      type="email"
                      value={editData.tenantEmail || ''}
                      onChange={(e) => setEditData({ ...editData, tenantEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الهوية</label>
                    <input
                      type="text"
                      value={editData.tenantId || ''}
                      onChange={(e) => setEditData({ ...editData, tenantId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium text-gray-700">الاسم:</span> <span className="text-gray-900">{rental.tenantName}</span></p>
                  <p><span className="font-medium text-gray-700">الهاتف:</span> <span className="text-gray-900">{rental.tenantPhone}</span></p>
                  <p><span className="font-medium text-gray-700">البريد:</span> <span className="text-gray-900">{rental.tenantEmail}</span></p>
                  {rental.tenantId && <p><span className="font-medium text-gray-700">الهوية:</span> <span className="text-gray-900">{rental.tenantId}</span></p>}
                </div>
              )}
            </motion.div>

            {/* التواريخ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-orange-50 rounded-lg p-6 border-2 border-orange-300"
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-bold text-orange-900 flex items-center gap-2">
                  <FaCalendarAlt className="w-5 h-5" />
                  التواريخ المهمة
                </h5>
                {editingSection !== 'dates' && <EditButton section="dates" />}
                {editingSection === 'dates' && <SaveCancelButtons section="dates" />}
              </div>
              
              {editingSection === 'dates' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الاستئجار الفعلي</label>
                    <input
                      type="date"
                      value={editData.actualRentalDate || ''}
                      onChange={(e) => setEditData({ ...editData, actualRentalDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ استلام الوحدة</label>
                    <input
                      type="date"
                      value={editData.unitHandoverDate || ''}
                      onChange={(e) => setEditData({ ...editData, unitHandoverDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ بدء العقد</label>
                    <input
                      type="date"
                      value={editData.startDate || ''}
                      onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ انتهاء العقد</label>
                    <input
                      type="date"
                      value={editData.endDate || ''}
                      onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المدة (بالأشهر)</label>
                    <input
                      type="number"
                      value={editData.duration || 12}
                      onChange={(e) => setEditData({ ...editData, duration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">يوم استحقاق الإيجار</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={editData.rentDueDay || 1}
                      onChange={(e) => setEditData({ ...editData, rentDueDay: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {rental.actualRentalDate && <p><span className="font-medium text-gray-700">تاريخ الاستئجار الفعلي:</span> <span className="text-gray-900">{new Date(rental.actualRentalDate).toLocaleDateString('en-GB')}</span></p>}
                  {rental.unitHandoverDate && <p><span className="font-medium text-gray-700">تاريخ استلام الوحدة:</span> <span className="text-gray-900">{new Date(rental.unitHandoverDate).toLocaleDateString('en-GB')}</span></p>}
                  <p><span className="font-medium text-gray-700">تاريخ بدء العقد:</span> <span className="text-gray-900">{new Date(rental.startDate).toLocaleDateString('en-GB')}</span></p>
                  <p><span className="font-medium text-gray-700">تاريخ انتهاء العقد:</span> <span className="text-gray-900">{new Date(rental.endDate).toLocaleDateString('en-GB')}</span></p>
                  <p><span className="font-medium text-gray-700">المدة:</span> <span className="text-gray-900">{rental.duration} شهر</span></p>
                  {rental.rentDueDay && <p><span className="font-medium text-gray-700">يوم الاستحقاق:</span> <span className="text-gray-900">اليوم {rental.rentDueDay} من كل شهر</span></p>}
                </div>
              )}
            </motion.div>

            {/* المبالغ المالية */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-green-50 rounded-lg p-6 border-2 border-green-300"
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-bold text-green-900 flex items-center gap-2">
                  <FaMoneyBillWave className="w-5 h-5" />
                  المبالغ المالية
                </h5>
                {editingSection !== 'financial' && <EditButton section="financial" />}
                {editingSection === 'financial' && <SaveCancelButtons section="financial" />}
              </div>
              
              {editingSection === 'financial' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الإيجار الشهري (OMR)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={editData.monthlyRent || 0}
                      onChange={(e) => setEditData({ ...editData, monthlyRent: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">مبلغ الضمان (OMR)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={editData.deposit || 0}
                      onChange={(e) => setEditData({ ...editData, deposit: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">عدد أيام السماح</label>
                    <input
                      type="number"
                      value={editData.gracePeriodDays || 0}
                      onChange={(e) => setEditData({ ...editData, gracePeriodDays: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">مبلغ السماح (OMR)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={editData.gracePeriodAmount || 0}
                      onChange={(e) => setEditData({ ...editData, gracePeriodAmount: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium text-gray-700">الإيجار الشهري:</span> <span className="text-gray-900 font-bold">{rental.monthlyRent.toFixed(3)} {rental.currency}</span></p>
                    <p><span className="font-medium text-gray-700">مبلغ الضمان:</span> <span className="text-gray-900">{rental.deposit.toFixed(3)} {rental.currency}</span></p>
                    {rental.gracePeriodDays > 0 && (
                      <p><span className="font-medium text-gray-700">فترة السماح:</span> <span className="text-gray-900">{rental.gracePeriodDays} يوم ({rental.gracePeriodAmount.toFixed(3)} {rental.currency})</span></p>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    {rental.includesVAT && (
                      <p><span className="font-medium text-gray-700">ضريبة القيمة المضافة:</span> <span className="text-gray-900">{rental.vatRate * 100}% ({rental.totalVATAmount.toFixed(3)} {rental.currency})</span></p>
                    )}
                    <p className="font-bold text-green-900"><span className="font-medium text-gray-700">إجمالي العقد:</span> {(rental.monthlyRent * rental.duration).toFixed(3)} {rental.currency}</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* معلومات المؤجر (المالك) - للقراءة فقط */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-indigo-50 rounded-lg p-6 border-2 border-indigo-300"
            >
              <h5 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                <FaUser className="w-5 h-5" />
                معلومات المؤجر (المالك) - للقراءة فقط
              </h5>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-gray-700">اسم المالك:</span> <span className="text-gray-900">{property?.ownerName || 'غير محدد'}</span></p>
                <p><span className="font-medium text-gray-700">الهاتف:</span> <span className="text-gray-900">{property?.ownerPhone || 'غير محدد'}</span></p>
                <p><span className="font-medium text-gray-700">البريد:</span> <span className="text-gray-900">{property?.ownerEmail || 'غير محدد'}</span></p>
                <p><span className="font-medium text-gray-700">معرف المالك:</span> <span className="text-gray-900">{property?.ownerId || 'غير محدد'}</span></p>
              </div>
            </motion.div>

            {/* معلومات العقار - للقراءة فقط */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-blue-50 rounded-lg p-6 border-2 border-blue-300"
            >
              <h5 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <FaBuilding className="w-5 h-5" />
                معلومات العقار - للقراءة فقط
              </h5>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-gray-700">العقار:</span> <span className="text-gray-900">{property?.titleAr || property?.title || 'غير محدد'}</span></p>
                <p><span className="font-medium text-gray-700">الوحدة:</span> <span className="text-gray-900">الوحدة {rental.unitId || 'N/A'}</span></p>
                <p><span className="font-medium text-gray-700">النوع:</span> <span className="text-gray-900">{property?.buildingType === 'single' ? 'عقار مفرد' : 'عقار متعدد الوحدات'}</span></p>
                <p><span className="font-medium text-gray-700">المساحة:</span> <span className="text-gray-900">{property?.area || '554'} م²</span></p>
                <p><span className="font-medium text-gray-700">رقم المبنى:</span> <span className="text-gray-900">{property?.buildingNumber || 'غير محدد'}</span></p>
                <p><span className="font-medium text-gray-700">الرقم المتسلسل:</span> <span className="text-gray-900">{property?.serialNumber || 'غير محدد'}</span></p>
              </div>
            </motion.div>

            {/* البيانات الإضافية للعقار - للقراءة فقط */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-teal-50 rounded-lg p-6 border-2 border-teal-300"
            >
              <h5 className="font-bold text-teal-900 mb-3 flex items-center gap-2">
                <FaMapMarkerAlt className="w-5 h-5" />
                البيانات الإضافية للعقار - للقراءة فقط
              </h5>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-gray-700">المجمع:</span> <span className="text-gray-900">{property?.complexName || 'غير محدد'}</span></p>
                <p><span className="font-medium text-gray-700">رقم المجمع:</span> <span className="text-gray-900">{property?.complexNumber || 'غير محدد'}</span></p>
                <p><span className="font-medium text-gray-700">السكة:</span> <span className="text-gray-900">{property?.streetName || 'غير محدد'}</span></p>
                <p><span className="font-medium text-gray-700">رقم الطريق:</span> <span className="text-gray-900">{property?.roadNumber || 'غير محدد'}</span></p>
                <p><span className="font-medium text-gray-700">الرقم المساحي:</span> <span className="text-gray-900">{property?.surveyNumber || 'غير محدد'}</span></p>
                <p><span className="font-medium text-gray-700">رقم القطعة:</span> <span className="text-gray-900">{property?.plotNumber || 'غير محدد'}</span></p>
                <p><span className="font-medium text-gray-700">رقم المربع:</span> <span className="text-gray-900">{property?.squareNumber || 'غير محدد'}</span></p>
                <p><span className="font-medium text-gray-700">رقم البلوك:</span> <span className="text-gray-900">{property?.blockNumber || 'غير محدد'}</span></p>
              </div>
            </motion.div>

            {/* طرق الدفع */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-indigo-50 rounded-lg p-6 border-2 border-indigo-300"
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-bold text-indigo-900 flex items-center gap-2">
                  <FaDollarSign className="w-5 h-5" />
                  طرق الدفع
                </h5>
                {editingSection !== 'payment' && <EditButton section="payment" />}
                {editingSection === 'payment' && <SaveCancelButtons section="payment" />}
              </div>
              
              {editingSection === 'payment' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">طريقة دفع الإيجار</label>
                    <select
                      value={editData.rentPaymentMethod || 'cash'}
                      onChange={(e) => setEditData({ ...editData, rentPaymentMethod: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="cash">💵 نقداً</option>
                      <option value="check">📝 شيك</option>
                      <option value="bank_transfer">🏦 تحويل بنكي</option>
                      <option value="electronic_payment">💳 دفع إلكتروني</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">طريقة دفع الضمان</label>
                    <select
                      value={editData.depositPaymentMethod || 'cash'}
                      onChange={(e) => setEditData({ ...editData, depositPaymentMethod: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="cash">💵 نقداً</option>
                      <option value="check">📝 شيك</option>
                      <option value="cash_and_check">💵📝 نقدي + شيك</option>
                      <option value="bank_transfer">🏦 تحويل بنكي</option>
                      <option value="electronic_payment">💳 دفع إلكتروني</option>
                    </select>
                  </div>
                  {editData.depositPaymentMethod === 'cash_and_check' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ النقدي للضمان (OMR)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={editData.depositCashAmount || 0}
                        onChange={(e) => setEditData({ ...editData, depositCashAmount: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">دفع الإيجار:</p>
                    <p>
                      <span className="font-medium text-gray-700">الطريقة:</span>{' '}
                      {rental.rentPaymentMethod === 'cash' && '💵 نقداً'}
                      {rental.rentPaymentMethod === 'check' && '📝 شيك'}
                      {rental.rentPaymentMethod === 'bank_transfer' && '🏦 تحويل بنكي'}
                      {rental.rentPaymentMethod === 'electronic_payment' && '💳 دفع إلكتروني'}
                    </p>
                    {rental.rentPaymentMethod === 'check' && rental.rentChecks && (
                      <p><span className="font-medium text-gray-700">عدد الشيكات:</span> {rental.rentChecks.length}</p>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">دفع الضمان:</p>
                    <p>
                      <span className="font-medium text-gray-700">الطريقة:</span>{' '}
                      {rental.depositPaymentMethod === 'cash' && '💵 نقداً'}
                      {rental.depositPaymentMethod === 'check' && '📝 شيك'}
                      {rental.depositPaymentMethod === 'cash_and_check' && '💵📝 نقدي + شيك'}
                      {rental.depositPaymentMethod === 'bank_transfer' && '🏦 تحويل بنكي'}
                      {rental.depositPaymentMethod === 'electronic_payment' && '💳 دفع إلكتروني'}
                    </p>
                    {rental.depositPaymentMethod === 'cash_and_check' && (
                      <>
                        <p><span className="font-medium text-gray-700">المبلغ النقدي:</span> {rental.depositCashAmount.toFixed(3)} {rental.currency}</p>
                        <p><span className="font-medium text-gray-700">عدد الشيكات:</span> {rental.depositChecks?.length || 0}</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            {/* شيكات الإيجار */}
            {rental.rentChecks && rental.rentChecks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-blue-50 rounded-lg p-6 border-2 border-blue-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-bold text-blue-900 flex items-center gap-2">
                    <FaFileAlt className="w-5 h-5" />
                    شيكات الإيجار
                  </h5>
                  {editingSection !== 'rentChecks' && <EditButton section="rentChecks" />}
                  {editingSection === 'rentChecks' && <SaveCancelButtons section="rentChecks" />}
                </div>
{editingSection === 'rentChecks' ? (
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4">
                      <h6 className="font-semibold text-gray-900 mb-3">معلومات البنك</h6>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">اسم البنك</label>
                          <input
                            type="text"
                            value={editData.rentChecksBankName || ''}
                            onChange={(e) => setEditData({ ...editData, rentChecksBankName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">الفرع</label>
                          <input
                            type="text"
                            value={editData.rentChecksBankBranch || ''}
                            onChange={(e) => setEditData({ ...editData, rentChecksBankBranch: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">رقم الحساب</label>
                          <input
                            type="text"
                            value={editData.rentChecksBankAccount || ''}
                            onChange={(e) => setEditData({ ...editData, rentChecksBankAccount: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                    {editData.rentChecks && editData.rentChecks.map((check: any, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-blue-200">
                        <p className="font-semibold text-gray-900 mb-3">الشيك #{index + 1}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الشيك</label>
                            <input
                              type="text"
                              value={check.checkNumber || ''}
                              onChange={(e) => {
                                const updatedChecks = [...editData.rentChecks];
                                updatedChecks[index] = { ...check, checkNumber: e.target.value };
                                setEditData({ ...editData, rentChecks: updatedChecks });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ (OMR)</label>
                            <input
                              type="number"
                              step="0.001"
                              value={check.amount || 0}
                              onChange={(e) => {
                                const updatedChecks = [...editData.rentChecks];
                                updatedChecks[index] = { ...check, amount: parseFloat(e.target.value) };
                                setEditData({ ...editData, rentChecks: updatedChecks });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                            <input
                              type="date"
                              value={check.date ? check.date.split('T')[0] : ''}
                              onChange={(e) => {
                                const updatedChecks = [...editData.rentChecks];
                                updatedChecks[index] = { ...check, date: e.target.value };
                                setEditData({ ...editData, rentChecks: updatedChecks });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="mb-4 bg-white rounded-lg p-4">
                      <p className="text-sm mb-2"><span className="font-medium text-gray-700">البنك:</span> {rental.rentChecksBankName}</p>
                      <p className="text-sm mb-2"><span className="font-medium text-gray-700">الفرع:</span> {rental.rentChecksBankBranch}</p>
                      <p className="text-sm"><span className="font-medium text-gray-700">رقم الحساب:</span> {rental.rentChecksBankAccount}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {rental.rentChecks.map((check: any, index: number) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-blue-200">
                          <p className="font-semibold text-gray-900 mb-1">الشيك #{index + 1}</p>
                          <p className="text-xs"><span className="text-gray-600">رقم:</span> {check.checkNumber}</p>
                          <p className="text-xs"><span className="text-gray-600">المبلغ:</span> {check.amount} {rental.currency}</p>
                          <p className="text-xs"><span className="text-gray-600">التاريخ:</span> {new Date(check.date).toLocaleDateString('en-GB')}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <div className="mt-4 bg-white rounded-lg p-3">
                  <p className="text-sm font-bold text-green-700">
                    إجمالي شيكات الإيجار: {rental.rentChecks.reduce((sum: number, c: any) => sum + c.amount, 0).toFixed(3)} {rental.currency}
                  </p>
                  <p className="text-xs text-gray-600">عدد الشيكات: {rental.rentChecks.length} / {rental.duration}</p>
                </div>
              </motion.div>
            )}

            {/* شيكات الضمان */}
            {rental.depositChecks && rental.depositChecks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-purple-50 rounded-lg p-6 border-2 border-purple-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-bold text-purple-900 flex items-center gap-2">
                    <FaFileAlt className="w-5 h-5" />
                    شيكات الضمان
                  </h5>
                  {editingSection !== 'depositChecks' && <EditButton section="depositChecks" />}
                  {editingSection === 'depositChecks' && <SaveCancelButtons section="depositChecks" />}
                </div>
{editingSection === 'depositChecks' ? (
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4">
                      <h6 className="font-semibold text-gray-900 mb-3">معلومات البنك</h6>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">اسم البنك</label>
                          <input
                            type="text"
                            value={editData.depositChecksBankName || ''}
                            onChange={(e) => setEditData({ ...editData, depositChecksBankName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">الفرع</label>
                          <input
                            type="text"
                            value={editData.depositChecksBankBranch || ''}
                            onChange={(e) => setEditData({ ...editData, depositChecksBankBranch: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">رقم الحساب</label>
                          <input
                            type="text"
                            value={editData.depositChecksBankAccount || ''}
                            onChange={(e) => setEditData({ ...editData, depositChecksBankAccount: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                    {editData.depositChecks && editData.depositChecks.map((check: any, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-purple-200">
                        <p className="font-semibold text-gray-900 mb-3">الشيك #{index + 1}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الشيك</label>
                            <input
                              type="text"
                              value={check.checkNumber || ''}
                              onChange={(e) => {
                                const updatedChecks = [...editData.depositChecks];
                                updatedChecks[index] = { ...check, checkNumber: e.target.value };
                                setEditData({ ...editData, depositChecks: updatedChecks });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ (OMR)</label>
                            <input
                              type="number"
                              step="0.001"
                              value={check.amount || 0}
                              onChange={(e) => {
                                const updatedChecks = [...editData.depositChecks];
                                updatedChecks[index] = { ...check, amount: parseFloat(e.target.value) };
                                setEditData({ ...editData, depositChecks: updatedChecks });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ (اختياري)</label>
                            <input
                              type="date"
                              value={check.date ? check.date.split('T')[0] : ''}
                              onChange={(e) => {
                                const updatedChecks = [...editData.depositChecks];
                                updatedChecks[index] = { ...check, date: e.target.value, hasDate: e.target.value ? true : false };
                                setEditData({ ...editData, depositChecks: updatedChecks });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="mb-4 bg-white rounded-lg p-4">
                      <p className="text-sm mb-2"><span className="font-medium text-gray-700">البنك:</span> {rental.depositChecksBankName}</p>
                      <p className="text-sm mb-2"><span className="font-medium text-gray-700">الفرع:</span> {rental.depositChecksBankBranch}</p>
                      <p className="text-sm"><span className="font-medium text-gray-700">رقم الحساب:</span> {rental.depositChecksBankAccount}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {rental.depositChecks.map((check: any, index: number) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                          <p className="font-semibold text-gray-900 mb-1">الشيك #{index + 1}</p>
                          <p className="text-xs"><span className="text-gray-600">رقم:</span> {check.checkNumber}</p>
                          <p className="text-xs"><span className="text-gray-600">المبلغ:</span> {check.amount} {rental.currency}</p>
                          <p className="text-xs"><span className="text-gray-600">التاريخ:</span> {check.hasDate === false ? 'شيك بدون تاريخ' : new Date(check.date).toLocaleDateString('en-GB')}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <div className="mt-4 bg-white rounded-lg p-3">
                  <p className="text-sm font-bold text-purple-700">
                    إجمالي شيكات الضمان: {rental.depositChecks.reduce((sum: number, c: any) => sum + c.amount, 0).toFixed(3)} {rental.currency}
                  </p>
                  {rental.depositPaymentMethod === 'cash_and_check' && (
                    <p className="text-sm mt-1 text-gray-700">
                      إجمالي الضمان: {(rental.depositCashAmount + rental.depositChecks.reduce((sum: number, c: any) => sum + c.amount, 0)).toFixed(3)} {rental.currency} (نقدي: {rental.depositCashAmount} + شيكات: {rental.depositChecks.reduce((sum: number, c: any) => sum + c.amount, 0).toFixed(3)})
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* المستندات الرسمية */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-purple-50 rounded-lg p-6 border-2 border-purple-300"
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-bold text-purple-900 flex items-center gap-2">
                  <FaFileAlt className="w-5 h-5" />
                  المستندات الرسمية
                </h5>
                {editingSection !== 'documents' && <EditButton section="documents" />}
                {editingSection === 'documents' && <SaveCancelButtons section="documents" />}
              </div>
              
              {editingSection === 'documents' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم استمارة البلدية</label>
                    <input
                      type="text"
                      value={editData.municipalityFormNumber || ''}
                      onChange={(e) => setEditData({ ...editData, municipalityFormNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم العقد المعتمد</label>
                    <input
                      type="text"
                      value={editData.municipalityContractNumber || ''}
                      onChange={(e) => setEditData({ ...editData, municipalityContractNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رسوم التسجيل (OMR)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={editData.municipalityRegistrationFee || 0}
                      onChange={(e) => setEditData({ ...editData, municipalityRegistrationFee: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رسوم البلدية (OMR)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={editData.municipalityFees || 0}
                      onChange={(e) => setEditData({ ...editData, municipalityFees: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <p><span className="font-medium text-gray-700">رقم استمارة البلدية:</span> <span className="text-gray-900">{rental.municipalityFormNumber}</span></p>
                  {rental.municipalityContractNumber && (
                    <p><span className="font-medium text-gray-700">رقم العقد المعتمد:</span> <span className="text-gray-900">{rental.municipalityContractNumber}</span></p>
                  )}
                  <p><span className="font-medium text-gray-700">رسوم التسجيل:</span> <span className="text-gray-900">{rental.municipalityRegistrationFee} {rental.currency}</span></p>
                  <p><span className="font-medium text-gray-700">رسوم البلدية (3%):</span> <span className="text-gray-900">{rental.municipalityFees.toFixed(3)} {rental.currency}</span></p>
                </div>
              )}
            </motion.div>

            {/* قراءات العدادات */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="bg-yellow-50 rounded-lg p-6 border-2 border-yellow-300"
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-bold text-yellow-900 flex items-center gap-2">
                  <FaFileAlt className="w-5 h-5" />
                  قراءات العدادات
                </h5>
                {editingSection !== 'meters' && <EditButton section="meters" />}
                {editingSection === 'meters' && <SaveCancelButtons section="meters" />}
              </div>
              
              {editingSection === 'meters' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h6 className="font-semibold text-gray-900">⚡ الكهرباء:</h6>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">القراءة</label>
                      <input
                        type="text"
                        value={editData.electricityMeterReading || ''}
                        onChange={(e) => setEditData({ ...editData, electricityMeterReading: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">مبلغ الفاتورة (OMR)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={editData.electricityBillAmount || 0}
                        onChange={(e) => setEditData({ ...editData, electricityBillAmount: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h6 className="font-semibold text-gray-900">💧 الماء:</h6>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">القراءة</label>
                      <input
                        type="text"
                        value={editData.waterMeterReading || ''}
                        onChange={(e) => setEditData({ ...editData, waterMeterReading: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">مبلغ الفاتورة (OMR)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={editData.waterBillAmount || 0}
                        onChange={(e) => setEditData({ ...editData, waterBillAmount: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">⚡ الكهرباء:</p>
                    <p><span className="font-medium text-gray-700">القراءة:</span> {rental.electricityMeterReading}</p>
                    {rental.electricityBillAmount > 0 && (
                      <p><span className="font-medium text-gray-700">مبلغ الفاتورة:</span> {rental.electricityBillAmount.toFixed(3)} {rental.currency}</p>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">💧 الماء:</p>
                    <p><span className="font-medium text-gray-700">القراءة:</span> {rental.waterMeterReading}</p>
                    {rental.waterBillAmount > 0 && (
                      <p><span className="font-medium text-gray-700">مبلغ الفاتورة:</span> {rental.waterBillAmount.toFixed(3)} {rental.currency}</p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            {/* رسوم الإنترنت */}
            {rental.internetIncluded && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="bg-cyan-50 rounded-lg p-6 border-2 border-cyan-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-bold text-cyan-900 flex items-center gap-2">
                    <FaMoneyBillWave className="w-5 h-5" />
                    رسوم الإنترنت
                  </h5>
                  {editingSection !== 'internet' && <EditButton section="internet" />}
                  {editingSection === 'internet' && <SaveCancelButtons section="internet" />}
                </div>
                
                {editingSection === 'internet' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">نوع الاشتراك</label>
                      <select
                        value={editData.internetPaymentType || 'monthly'}
                        onChange={(e) => setEditData({ ...editData, internetPaymentType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="monthly">شهري</option>
                        <option value="annually">سنوي</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ (OMR)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={editData.internetFees || 0}
                        onChange={(e) => setEditData({ ...editData, internetFees: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium text-gray-700">مشمول في الإيجار:</span> <span className="text-gray-900">نعم</span></p>
                    <p><span className="font-medium text-gray-700">نوع الاشتراك:</span> <span className="text-gray-900">{rental.internetPaymentType === 'annually' ? 'سنوي' : 'شهري'}</span></p>
                    <p><span className="font-medium text-gray-700">المبلغ:</span> <span className="text-gray-900">{rental.internetFees.toFixed(3)} {rental.currency}</span></p>
                  </div>
                )}
              </motion.div>
            )}

            {/* رسوم أخرى */}
            {rental.hasOtherFees && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="bg-pink-50 rounded-lg p-6 border-2 border-pink-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-bold text-pink-900">رسوم أخرى</h5>
                  {editingSection !== 'otherFees' && <EditButton section="otherFees" />}
                  {editingSection === 'otherFees' && <SaveCancelButtons section="otherFees" />}
                </div>
                
                {editingSection === 'otherFees' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                      <input
                        type="text"
                        value={editData.otherFeesDescription || ''}
                        onChange={(e) => setEditData({ ...editData, otherFeesDescription: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ (OMR)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={editData.otherFeesAmount || 0}
                        onChange={(e) => setEditData({ ...editData, otherFeesAmount: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium text-gray-700">الوصف:</span> <span className="text-gray-900">{rental.otherFeesDescription}</span></p>
                    <p><span className="font-medium text-gray-700">المبلغ:</span> <span className="text-gray-900">{rental.otherFeesAmount.toFixed(3)} {rental.currency}</span></p>
                  </div>
                )}
              </motion.div>
            )}

            {/* الإيجارات الشهرية المخصصة */}
            {rental.useCustomMonthlyRents && rental.customMonthlyRents && rental.customMonthlyRents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="bg-indigo-50 rounded-lg p-6 border-2 border-indigo-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-bold text-indigo-900 flex items-center gap-2">
                    <FaMoneyBillWave className="w-5 h-5" />
                    جدول الإيجارات الشهرية المخصصة
                  </h5>
                  {editingSection !== 'customRents' && <EditButton section="customRents" />}
                  {editingSection === 'customRents' && <SaveCancelButtons section="customRents" />}
                </div>
{editingSection === 'customRents' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {editData.customMonthlyRents && editData.customMonthlyRents.map((amount: number, index: number) => {
                      const monthDate = new Date(rental.startDate);
                      monthDate.setMonth(monthDate.getMonth() + index);
                      return (
                        <div key={index} className="bg-white rounded-lg p-4 border border-indigo-200">
                          <p className="font-semibold text-gray-900 mb-2">الشهر {index + 1}</p>
                          <p className="text-xs text-gray-600 mb-2">{monthDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">الإيجار (OMR)</label>
                            <input
                              type="number"
                              step="0.001"
                              value={amount || 0}
                              onChange={(e) => {
                                const updatedRents = [...editData.customMonthlyRents];
                                updatedRents[index] = parseFloat(e.target.value);
                                setEditData({ ...editData, customMonthlyRents: updatedRents });
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {rental.customMonthlyRents.map((amount: number, index: number) => {
                      const monthDate = new Date(rental.startDate);
                      monthDate.setMonth(monthDate.getMonth() + index);
                      return (
                        <div key={index} className="bg-white rounded-lg p-3 border border-indigo-200">
                          <p className="font-semibold text-gray-900 text-sm">الشهر {index + 1}</p>
                          <p className="text-xs text-gray-600">{monthDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
                          <p className="text-sm font-bold text-indigo-700 mt-1">{amount.toFixed(3)} {rental.currency}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="mt-4 bg-white rounded-lg p-3">
                  <p className="text-sm font-bold text-indigo-700">
                    إجمالي الإيجارات: {rental.customMonthlyRents.reduce((sum: number, amount: number) => sum + amount, 0).toFixed(3)} {rental.currency}
                  </p>
                  <p className="text-xs text-gray-600">متوسط الإيجار الشهري: {(rental.customMonthlyRents.reduce((sum: number, amount: number) => sum + amount, 0) / rental.customMonthlyRents.length).toFixed(3)} {rental.currency}</p>
                </div>
              </motion.div>
            )}

            {/* الملخص المالي الشامل - للقراءة فقط */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-300"
            >
              <h5 className="font-bold text-green-900 mb-4 text-lg">💰 ملخص الحسابات النهائية</h5>
              
              <div className="bg-white rounded-lg p-4 mb-4">
                <h6 className="font-semibold text-gray-900 mb-3">مستحقات المستأجر</h6>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">الإيجار الأساسي الكامل:</span>
                    <span className="font-medium">{(rental.monthlyRent * rental.duration).toFixed(3)} {rental.currency}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t-2 pt-3 mt-3 text-green-900">
                    <span>إجمالي مستحقات المستأجر:</span>
                    <span>{(
                      (rental.useCustomMonthlyRents && rental.customMonthlyRents
                        ? rental.customMonthlyRents.reduce((sum: number, amount: number) => sum + amount, 0)
                        : (rental.monthlyRent * rental.duration)) +
                      (rental.includesVAT ? rental.totalVATAmount : 0) +
                      (rental.hasOtherTaxes ? rental.totalOtherTaxAmount : 0) +
                      (rental.deposit || 0) +
                      (rental.internetIncluded ? rental.internetFees : 0) +
                      (rental.hasOtherFees ? rental.otherFeesAmount : 0)
                    ).toFixed(3)} {rental.currency}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-100 rounded-lg p-4 mt-4">
                <h6 className="font-semibold text-orange-900 mb-3">🏛️ مستحقات المالك للبلدية <span className="text-xs font-normal">(لا يدفعها المستأجر)</span></h6>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span className="text-orange-900">إجمالي مستحقات المالك:</span>
                    <span className="text-orange-900">{(
                      rental.municipalityFees +
                      rental.municipalityRegistrationFee +
                      (rental.electricityBillAmount || 0) +
                      (rental.waterBillAmount || 0)
                    ).toFixed(3)} {rental.currency}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* معلومات إضافية - للقراءة فقط */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="font-semibold text-gray-900 mb-4">معلومات إضافية</h3>
              <div className="space-y-4">
                {/* معلومات النظام */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h6 className="font-semibold text-gray-900 mb-3">معلومات النظام</h6>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">معرف العقد</span>
                      <span className="font-mono text-xs text-gray-900">{rental.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">تاريخ الإنشاء</span>
                      <span className="font-medium text-gray-900">
                        {rental.createdAt ? new Date(rental.createdAt).toLocaleDateString('en-GB') + ' - ' + new Date(rental.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'غير محدد'}
                      </span>
                    </div>
                    {rental.updatedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">آخر تحديث</span>
                        <span className="font-medium text-gray-900">
                          {new Date(rental.updatedAt).toLocaleDateString('en-GB') + ' - ' + new Date(rental.updatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* مدخل العقد */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h6 className="font-semibold text-gray-900 mb-3">مدخل العقد</h6>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">اسم المدخل</span>
                      <span className="font-medium text-gray-900">{rental.createdBy || rental.history?.[0]?.by || 'demo-user'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">تاريخ الإدخال</span>
                      <span className="font-medium text-gray-900">
                        {rental.createdAt ? new Date(rental.createdAt).toLocaleDateString('en-GB') : 'غير محدد'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">وقت الإدخال</span>
                      <span className="font-medium text-gray-900">
                        {rental.createdAt ? new Date(rental.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'غير محدد'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* الموقعون على العقد */}
                {rental.signatures && rental.signatures.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h6 className="font-semibold text-gray-900 mb-3">الموقعون على العقد</h6>
                    <div className="space-y-3">
                      {rental.signatures.map((sig: any, index: number) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-green-200">
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">الموقع #{index + 1}</span>
                              <span className="font-medium text-gray-900">{sig.signerName || sig.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">الصفة</span>
                              <span className="text-gray-700">{sig.role === 'owner' ? 'المالك' : sig.role === 'tenant' ? 'المستأجر' : sig.role}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">تاريخ التوقيع</span>
                              <span className="text-gray-900">{new Date(sig.signedAt).toLocaleDateString('en-GB')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">وقت التوقيع</span>
                              <span className="text-gray-900">{new Date(sig.signedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ملاحظة في حالة عدم وجود توقيعات */}
                {(!rental.signatures || rental.signatures.length === 0) && (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <p className="text-sm text-yellow-800">⚠️ لم يتم توقيع العقد بعد</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* أزرار الحفظ النهائية */}
            {canEdit && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8 }}
                className="flex justify-center gap-4 pt-8"
              >
                <button
                  onClick={() => setShowPreview(true)}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-3 text-lg font-semibold shadow-lg"
                >
                  <FaFileContract className="w-5 h-5" />
                  معاينة العقد قبل الحفظ
                </button>
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-3 text-lg font-semibold shadow-lg disabled:opacity-50"
                >
                  <FaSave className="w-5 h-5" />
                  {saving ? 'جاري الحفظ...' : 'حفظ جميع التعديلات'}
                </button>
              </motion.div>
            )}

          </div>
        </main>
      </div>

      {/* Modal المعاينة */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">معاينة العقد</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* نوع العقد */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h4 className="font-bold text-purple-900 mb-2">نوع العقد</h4>
                <p className="text-lg">{editData.contractType === 'residential' ? '🏠 عقد سكني' : '🏢 عقد تجاري'}</p>
              </div>

              {/* المعلومات الأساسية */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-bold text-green-900 mb-2">المستأجر</h4>
                  <p className="text-sm"><strong>الاسم:</strong> {editData.tenantName}</p>
                  <p className="text-sm"><strong>الهاتف:</strong> {editData.tenantPhone}</p>
                  <p className="text-sm"><strong>البريد:</strong> {editData.tenantEmail}</p>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <h4 className="font-bold text-orange-900 mb-2">التواريخ</h4>
                  <p className="text-sm"><strong>بدء العقد:</strong> {editData.startDate}</p>
                  <p className="text-sm"><strong>انتهاء العقد:</strong> {editData.endDate}</p>
                  <p className="text-sm"><strong>المدة:</strong> {editData.duration} شهر</p>
                </div>
              </div>

              {/* المبالغ */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-bold text-green-900 mb-2">المبالغ المالية</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p><strong>الإيجار الشهري:</strong> {editData.monthlyRent} {editData.currency}</p>
                  <p><strong>الضمان:</strong> {editData.deposit} {editData.currency}</p>
                  <p><strong>فترة السماح:</strong> {editData.gracePeriodDays} يوم</p>
                  <p><strong>إجمالي العقد:</strong> {(editData.monthlyRent * editData.duration).toFixed(3)} {editData.currency}</p>
                </div>
              </div>

              {/* طرق الدفع */}
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <h4 className="font-bold text-indigo-900 mb-2">طرق الدفع</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p><strong>دفع الإيجار:</strong> {editData.rentPaymentMethod}</p>
                  <p><strong>دفع الضمان:</strong> {editData.depositPaymentMethod}</p>
                  {editData.rentChecks && <p><strong>عدد شيكات الإيجار:</strong> {editData.rentChecks.length}</p>}
                  {editData.depositChecks && <p><strong>عدد شيكات الضمان:</strong> {editData.depositChecks.length}</p>}
                </div>
              </div>

              {/* المستندات */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h4 className="font-bold text-purple-900 mb-2">المستندات الرسمية</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p><strong>رقم الاستمارة:</strong> {editData.municipalityFormNumber}</p>
                  <p><strong>رقم العقد المعتمد:</strong> {editData.municipalityContractNumber}</p>
                  <p><strong>رسوم التسجيل:</strong> {editData.municipalityRegistrationFee} OMR</p>
                  <p><strong>رسوم البلدية:</strong> {editData.municipalityFees} OMR</p>
                </div>
              </div>

              {/* العدادات */}
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h4 className="font-bold text-yellow-900 mb-2">قراءات العدادات</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold">⚡ الكهرباء:</p>
                    <p>القراءة: {editData.electricityMeterReading}</p>
                    <p>الفاتورة: {editData.electricityBillAmount} OMR</p>
                  </div>
                  <div>
                    <p className="font-semibold">💧 الماء:</p>
                    <p>القراءة: {editData.waterMeterReading}</p>
                    <p>الفاتورة: {editData.waterBillAmount} OMR</p>
                  </div>
                </div>
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex justify-center gap-4 pt-6 border-t">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <FaTimes className="w-4 h-4" />
                  إغلاق
                </button>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    handleSaveAll();
                  }}
                  disabled={saving}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <FaSave className="w-4 h-4" />
                  حفظ الآن
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default EditRentalContractPage;
