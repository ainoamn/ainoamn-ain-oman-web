// @ts-nocheck
import React, { useState, useEffect } from "react";
import Head from "next/head";
import InstantLink from '@/components/InstantLink';
import Layout from "@/components/layout/Layout";
import { useTSafe } from "@/lib/i18n-safe";
import HoaNav from "@/components/hoa/HoaNav";
import { useHoa } from "@/context/hoa";
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiEye } from "react-icons/fi";

export default function BuildingsIndex() {
  const { t, dir } = useTSafe();
  const { buildings, removeItem, loading: contextLoading } = useHoa();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBuildings, setFilteredBuildings] = useState(buildings);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (searchTerm) {
      const filtered = buildings.filter(building =>
        building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        building.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBuildings(filtered);
    } else {
      setFilteredBuildings(buildings);
    }
  }, [searchTerm, buildings]);

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      removeItem("buildings", id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      // إلغاء التأكيد بعد 3 ثوان
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <Layout>
      <Head>
        <title>{t("hoa.buildings.title", "المباني")}</title>
      </Head>
      
      <div dir={dir} className="space-y-6 p-4 md:p-6">
        <HoaNav />
        
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t("hoa.buildings.title", "المباني")}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t("hoa.buildings.subtitle", "إدارة جميع مباني جمعيات الملاك")}
            </p>
          </div>
          
          <InstantLink 
            href="/owners-association/buildings/create"
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors"
          >
            <FiPlus size={16} />
            {t("hoa.buildings.addBuilding", "إضافة مبنى")}
          </InstantLink>
        </header>

        {/* شريط البحث */}
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <FiSearch className="text-gray-400" size={18} />
          </div>
          <input
            type="text"
            placeholder={t("hoa.buildings.searchPlaceholder", "ابحث بالمبنى أو العنوان...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full ps-10 pe-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        {/* نتائج البحث */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {contextLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">{t("loading", "جاري التحميل...")}</p>
            </div>
          ) : filteredBuildings.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              {searchTerm ? (
                <p>{t("hoa.buildings.noResults", "لا توجد نتائج تطابق بحثك")}</p>
              ) : (
                <>
                  <p className="mb-4">{t("hoa.buildings.noBuildings", "لا توجد مباني مسجلة بعد")}</p>
                  <InstantLink 
                    href="/owners-association/buildings/create"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors"
                  >
                    <FiPlus size={16} />
                    {t("hoa.buildings.addFirstBuilding", "أضف أول مبنى")}
                  </InstantLink>
                </>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredBuildings.map((building) => (
                <div key={building.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {building.name}
                    </div>
                    {building.address && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {building.address}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {building.unitsCount || 0} {t("hoa.buildings.units", "وحدات")}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <InstantLink 
                      href={`/owners-association/buildings/${building.id}`}
                      className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title={t("view", "عرض")}
                    >
                      <FiEye size={18} />
                    </InstantLink>
                    
                    <InstantLink 
                      href={`/owners-association/buildings/edit/${building.id}`}
                      className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title={t("edit", "تعديل")}
                    >
                      <FiEdit size={18} />
                    </InstantLink>
                    
                    <button
                      onClick={() => handleDelete(building.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        deleteConfirm === building.id
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          : "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                      }`}
                      title={t("delete", "حذف")}
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                  
                  {deleteConfirm === building.id && (
                    <div className="sm:col-span-full mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                        {t("hoa.buildings.deleteConfirm", "هل أنت متأكد من حذف هذا المبنى؟")}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(building.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg"
                        >
                          {t("confirm", "تأكيد")}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg"
                        >
                          {t("cancel", "إلغاء")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
