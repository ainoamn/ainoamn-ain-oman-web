import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import { useTSafe } from "@/lib/i18n-safe";
import HoaNav from "@/components/hoa/HoaNav";
import { useHoa } from "@/context/hoa";
import { FiSave, FiArrowLeft, FiHome, FiMapPin } from "react-icons/fi";

export default function CreateHoaPage() {
  const { t, dir } = useTSafe();
  const router = useRouter();
  const { addHOA, addBuilding, addUnit, loading } = useHoa();
  
  const [formData, setFormData] = useState({
    name: "",
    status: "active",
    address: "",
    buildingName: "",
    units: [] as Array<{ name: string; owner: string; area: string }>
  });
  
  const [currentUnit, setCurrentUnit] = useState({ name: "", owner: "", area: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t("validation.nameRequired", "اسم الجمعية مطلوب");
    }
    
    if (!formData.buildingName.trim()) {
      newErrors.buildingName = t("validation.buildingNameRequired", "اسم المبنى مطلوب");
    }
    
    if (formData.units.length === 0) {
      newErrors.units = t("validation.unitsRequired", "يجب إضافة وحدة واحدة على الأقل");
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addUnitToForm = () => {
    if (!currentUnit.name.trim() || !currentUnit.owner.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      units: [...prev.units, { ...currentUnit }]
    }));
    
    setCurrentUnit({ name: "", owner: "", area: "" });
  };

  const removeUnit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      units: prev.units.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || submitting) return;
    
    setSubmitting(true);
    
    try {
      // إنشاء جمعية جديدة
      const newHOA = {
        id: `HOA-${Date.now()}`,
        name: formData.name,
        status: formData.status as "active" | "inactive",
        createdAt: new Date().toISOString()
      };
      
      addHOA(newHOA);
      
      // إنشاء مبنى جديد
      const newBuilding = {
        id: `B-${Date.now()}`,
        hoaId: newHOA.id,
        name: formData.buildingName,
        address: formData.address,
        unitsCount: formData.units.length
      };
      
      addBuilding(newBuilding);
      
      // إضافة الوحدات
      formData.units.forEach((unit, index) => {
        const newUnit = {
          id: `U-${Date.now()}-${index}`,
          buildingId: newBuilding.id,
          name: unit.name,
          owner: unit.owner,
          area: unit.area ? parseFloat(unit.area) : undefined,
          balance: 0
        };
        
        addUnit(newUnit);
      });
      
      // الانتقال إلى صفحة التفاصيل
      router.push(`/owners-association/properties/${newHOA.id}`);
      
    } catch (error) {
      console.error("Create error:", error);
      setErrors({ submit: t("validation.submitError", "حدث خطأ أثناء الحفظ") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>{t("hoa.create.title", "إنشاء جمعية جديدة")}</title>
      </Head>
      
      <div dir={dir} className="space-y-6 p-4 md:p-6">
        <HoaNav />
        
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>
          
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t("hoa.create.title", "إنشاء جمعية جديدة")}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t("hoa.create.subtitle", "أضف جمعية ملاك جديدة والعقارات التابعة لها")}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* معلومات الجمعية */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiHome size={20} />
              {t("hoa.create.associationInfo", "معلومات الجمعية")}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("hoa.create.associationName", "اسم الجمعية")} *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 rounded-xl border ${
                    errors.name ? "border-red-300" : "border-gray-300 dark:border-gray-700"
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent`}
                  placeholder={t("hoa.create.associationPlaceholder", "اسم جمعية الملاك")}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("hoa.create.status", "الحالة")}
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="active">{t("status.active", "نشطة")}</option>
                  <option value="inactive">{t("status.inactive", "غير نشطة")}</option>
                </select>
              </div>
            </div>
          </div>

          {/* معلومات المبنى */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiMapPin size={20} />
              {t("hoa.create.buildingInfo", "معلومات المبنى")}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="buildingName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("hoa.create.buildingName", "اسم المبنى")} *
                </label>
                <input
                  type="text"
                  id="buildingName"
                  value={formData.buildingName}
                  onChange={(e) => setFormData({ ...formData, buildingName: e.target.value })}
                  className={`w-full px-4 py-2 rounded-xl border ${
                    errors.buildingName ? "border-red-300" : "border-gray-300 dark:border-gray-700"
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent`}
                  placeholder={t("hoa.create.buildingPlaceholder", "اسم المبنى أو البرج")}
                />
                {errors.buildingName && <p className="mt-1 text-sm text-red-600">{errors.buildingName}</p>}
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("hoa.create.address", "العنوان")}
                </label>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder={t("hoa.create.addressPlaceholder", "عنوان المبنى")}
                />
              </div>
            </div>
          </div>

          {/* الوحدات */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t("hoa.create.units", "الوحدات")} *
            </h2>
            
            {errors.units && <p className="text-sm text-red-600 mb-4">{errors.units}</p>}
            
            {/* نموذج إضافة وحدة */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("hoa.create.unitName", "اسم الوحدة")} *
                </label>
                <input
                  type="text"
                  value={currentUnit.name}
                  onChange={(e) => setCurrentUnit({ ...currentUnit, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder={t("hoa.create.unitPlaceholder", "رقم أو اسم الوحدة")}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("hoa.create.ownerName", "اسم المالك")} *
                </label>
                <input
                  type="text"
                  value={currentUnit.owner}
                  onChange={(e) => setCurrentUnit({ ...currentUnit, owner: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder={t("hoa.create.ownerPlaceholder", "اسم مالك الوحدة")}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("hoa.create.area", "المساحة (م²)")}
                </label>
                <input
                  type="number"
                  value={currentUnit.area}
                  onChange={(e) => setCurrentUnit({ ...currentUnit, area: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder={t("hoa.create.areaPlaceholder", "المساحة بالمتر المربع")}
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div className="md:col-span-3 flex justify-end">
                <button
                  type="button"
                  onClick={addUnitToForm}
                  disabled={!currentUnit.name.trim() || !currentUnit.owner.trim()}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                >
                  {t("hoa.create.addUnit", "إضافة وحدة")}
                </button>
              </div>
            </div>
            
            {/* قائمة الوحدات المضافة */}
            {formData.units.length > 0 ? (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {t("hoa.create.addedUnits", "الوحدات المضافة")} ({formData.units.length})
                </h3>
                
                {formData.units.map((unit, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <div className="font-medium">{unit.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t("hoa.create.owner", "المالك")}: {unit.owner}
                        {unit.area && ` • ${unit.area} م²`}
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeUnit(index)}
                      className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      {t("hoa.create.remove", "حذف")}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>{t("hoa.create.noUnitsAdded", "لم تتم إضافة أي وحدات بعد")}</p>
              </div>
            )}
          </div>

          {/* أزرار التنفيذ */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {t("cancel", "إلغاء")}
            </button>
            
            <button
              type="submit"
              disabled={submitting || loading}
              className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {t("saving", "جاري الحفظ...")}
                </>
              ) : (
                <>
                  <FiSave size={16} />
                  {t("hoa.create.saveAssociation", "حفظ الجمعية")}
                </>
              )}
            </button>
          </div>
          
          {errors.submit && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-400">{errors.submit}</p>
            </div>
          )}
        </form>
      </div>
    </>
  );
}
