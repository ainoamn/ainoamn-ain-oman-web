import React, { useEffect, useState } from "react";
import Head from "next/head";
import InstantLink from '@/components/InstantLink';

import { useTSafe } from "@/lib/i18n-safe";
import HoaNav from "@/components/hoa/HoaNav";
import StatCard from "@/components/common/StatCard";
import { useHoa } from "@/context/hoa";
import { FiPlus, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

type HoaSummary = { id: string; name: string; status: string };

export default function OwnersAssociationHome() {
  const { t, dir } = useTSafe();
  const { hoas, alerts, loading: contextLoading } = useHoa();
  const [apiHoas, setApiHoas] = useState<HoaSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/hoa");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (mounted) {
          setApiHoas(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unknown error");

        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    
    return () => {
      mounted = false;
    };
  }, []);

  const activeAlerts = alerts.filter(alert => alert.level === "critical" || alert.level === "warning");
  const totalUnits = hoas.reduce((acc, hoa) => acc + (hoa.unitsCount || 0), 0);

  return (
    <>
      <Head>
        <title>{t("hoa.home.title", "جمعيات الملاك")}</title>
      </Head>
      
      <div dir={dir} className="space-y-6 p-4 md:p-6">
        <HoaNav />
        
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t("hoa.home.title", "جمعيات الملاك")}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t("hoa.home.subtitle", "إدارة جمعيات الملاك والعقارات")}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <InstantLink 
              href="/owners-association/create" 
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition-colors"
            >
              <FiPlus size={16} />
              {t("hoa.home.createAssociation", "إنشاء جمعية")}
            </InstantLink>
            
            <InstantLink 
              href="/admin/tasks" 
              className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t("hoa.home.tasks", "لوحة المهام")}
            </InstantLink>
          </div>
        </header>

        {/* نظام التنبيهات */}
        {activeAlerts.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FiAlertTriangle className="text-red-600" size={20} />
              <h3 className="font-medium text-red-800 dark:text-red-200">
                {t("hoa.home.importantAlerts", "تنبيهات مهمة")}
              </h3>
            </div>
            <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
              {activeAlerts.slice(0, 3).map(alert => (
                <li key={alert.id}>{alert.msg}</li>
              ))}
            </ul>
            {activeAlerts.length > 3 && (
              <InstantLink 
                href="/owners-association/alerts" 
                className="inline-block mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                {t("hoa.home.viewAllAlerts", "عرض جميع التنبيهات")} ({activeAlerts.length})
              </InstantLink>
            )}
          </div>
        )}

        {/* إحصائيات سريعة */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title={t("hoa.stats.totalAssociations", "عدد الجمعيات")} 
            value={loading ? "..." : String(apiHoas.length)} 
            hint={t("hoa.stats.activeAssociations", "جمعية نشطة")}
          />
          
          <StatCard 
            title={t("hoa.stats.totalUnits", "عدد الوحدات")} 
            value={totalUnits.toLocaleString()} 
            hint={t("hoa.stats.residentialUnits", "وحدة سكنية")}
          />
          
          <StatCard 
            title={t("hoa.stats.openTickets", "التذاكر المفتوحة")} 
            value="4" 
            hint={t("hoa.stats.needAttention", "تحتاج انتباه")}
          />
          
          <StatCard 
            title={t("hoa.stats.collectionRate", "معدل التحصيل")} 
            value="86%" 
            hint={t("hoa.stats.currentRate", "النسبة الحالية")}
          />
        </section>

        {/* قائمة الجمعيات */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {t("hoa.home.associationsList", "قائمة الجمعيات")}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t("hoa.home.associationsDescription", "جميع جمعيات الملاك المسجلة في النظام")}
              </p>
            </div>
            
            <InstantLink 
              href="/owners-association/management" 
              className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 underline"
            >
              {t("hoa.home.manage", "الإدارة المتقدمة")}
            </InstantLink>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {loading && (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
                <p className="mt-2">{t("loading", "جاري التحميل...")}</p>
              </div>
            )}
            
            {error && (
              <div className="p-4 text-center text-red-600 dark:text-red-400">
                <FiAlertTriangle className="inline-block mr-2" />
                {t("hoa.home.loadError", "خطأ في تحميل البيانات:")} {error}
              </div>
            )}
            
            {!loading && apiHoas.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <FiCheckCircle size={32} className="mx-auto mb-3 text-green-500" />
                <p>{t("hoa.home.noAssociations", "لا توجد جمعيات مسجلة بعد")}</p>
                <InstantLink 
                  href="/owners-association/create" 
                  className="inline-block mt-3 text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 underline"
                >
                  {t("hoa.home.createFirst", "أنشئ جمعيتك الأولى")}
                </InstantLink>
              </div>
            )}
            
            {!loading && apiHoas.map((hoa) => (
              <HoaRow key={hoa.id} hoa={hoa} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function HoaRow({ hoa }: { hoa: HoaSummary }) {
  const { t } = useTSafe();
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const fetchDetail = async () => {
      if (!hoa.id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/hoa/${hoa.id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (mounted) {
          setDetail(data);
        }
      } catch (err) {

      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchDetail();
    
    return () => {
      mounted = false;
    };
  }, [hoa.id]);

  return (
    <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 dark:text-white truncate">
          {hoa.name}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
            hoa.status === "active" 
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
          }`}>
            {hoa.status === "active" 
              ? t("status.active", "نشطة") 
              : t("status.inactive", "غير نشطة")}
          </span>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
        {loading ? (
          <div className="animate-pulse flex gap-4">
            <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ) : detail ? (
          <div className="flex flex-wrap gap-4">
            <span className="flex items-center gap-1">👥 {detail.members || 0}</span>
            <span className="flex items-center gap-1">🎫 {detail.openTickets || 0}</span>
            <span className="flex items-center gap-1">💳 {detail.collectionRate ? `${(detail.collectionRate * 100).toFixed(0)}%` : "0%"}</span>
          </div>
        ) : (
          <span>—</span>
        )}
      </div>
      
      <div className="flex-shrink-0">
        <InstantLink 
          href={`/owners-association/properties/${hoa.id}`} 
          className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm transition-colors"
        >
          {t("hoa.requests.viewDetails", "تفاصيل")}
        </InstantLink>
      </div>
    </div>
  );
}
