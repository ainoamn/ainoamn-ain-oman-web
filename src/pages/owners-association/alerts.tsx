import React, { useState, useEffect } from "react";
import Head from "next/head";
import InstantLink from '@/components/InstantLink';
import Layout from "@/components/layout/Layout";
import { useTSafe } from "@/lib/i18n-safe";
import HoaNav from "@/components/hoa/HoaNav";
import { useHoa } from "@/context/hoa";
import { FiAlertTriangle, FiBell, FiCheckCircle, FiFilter, FiX } from "react-icons/fi";

type AlertLevel = "info" | "warning" | "critical";

export default function AlertsPage() {
  const { t, dir } = useTSafe();
  const { alerts, updateDoc, units, docs } = useHoa();
  const [filterLevel, setFilterLevel] = useState<AlertLevel | "all">("all");
  const [filterResolved, setFilterResolved] = useState(false);
  const [filteredAlerts, setFilteredAlerts] = useState(alerts);

  useEffect(() => {
    let filtered = alerts;
    
    if (filterLevel !== "all") {
      filtered = filtered.filter(alert => alert.level === filterLevel);
    }
    
    if (!filterResolved) {
      filtered = filtered.filter(alert => !alert.resolved);
    }
    
    setFilteredAlerts(filtered);
  }, [alerts, filterLevel, filterResolved]);

  const resolveAlert = (alertId: string) => {
    // في التطبيق الحقيقي، سنقوم بتحديث حالة التنبيه
    console.log("Resolving alert:", alertId);
  };

  const getAlertIcon = (level: AlertLevel) => {
    switch (level) {
      case "critical":
        return <FiAlertTriangle className="text-red-500" size={20} />;
      case "warning":
        return <FiAlertTriangle className="text-yellow-500" size={20} />;
      case "info":
        return <FiBell className="text-blue-500" size={20} />;
      default:
        return <FiBell size={20} />;
    }
  };

  const getAlertColor = (level: AlertLevel) => {
    switch (level) {
      case "critical":
        return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800";
      case "info":
        return "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800";
      default:
        return "bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800";
    }
  };

  return (
    <Layout>
      <Head>
        <title>{t("hoa.alerts.title", "التنبيهات")}</title>
      </Head>
      
      <div dir={dir} className="space-y-6 p-4 md:p-6">
        <HoaNav />
        
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t("hoa.alerts.title", "التنبيهات")}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t("hoa.alerts.subtitle", "إدارة وتتبع جميع تنبيهات النظام")}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
              <FiAlertTriangle className="ml-1" size={14} />
              {alerts.filter(a => a.level === "critical" && !a.resolved).length} {t("hoa.alerts.critical", "حرجة")}
            </span>
            
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
              <FiAlertTriangle className="ml-1" size={14} />
              {alerts.filter(a => a.level === "warning" && !a.resolved).length} {t("hoa.alerts.warnings", "تحذيرات")}
            </span>
          </div>
        </header>

        {/* فلاتر التنبيهات */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <FiFilter size={18} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("hoa.alerts.filters", "الفلاتر")}:
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value as AlertLevel | "all")}
                className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="all">{t("hoa.alerts.allLevels", "جميع المستويات")}</option>
                <option value="critical">{t("hoa.alerts.critical", "حرجة")}</option>
                <option value="warning">{t("hoa.alerts.warnings", "تحذيرات")}</option>
                <option value="info">{t("hoa.alerts.info", "معلومات")}</option>
              </select>
              
              <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
                <input
                  type="checkbox"
                  checked={filterResolved}
                  onChange={(e) => setFilterResolved(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                {t("hoa.alerts.showResolved", "عرض الم solved")}
              </label>
              
              {(filterLevel !== "all" || filterResolved) && (
                <button
                  onClick={() => {
                    setFilterLevel("all");
                    setFilterResolved(false);
                  }}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <FiX size={16} />
                  {t("hoa.alerts.clearFilters", "مسح الفلاتر")}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* قائمة التنبيهات */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
              <FiCheckCircle size={48} className="mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t("hoa.alerts.noAlerts", "لا توجد تنبيهات")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filterLevel !== "all" || filterResolved
                  ? t("hoa.alerts.noFilteredAlerts", "لا توجد تنبيهات تطابق الفلاتر المحددة")
                  : t("hoa.alerts.allClear", "كل شيء تحت السيطرة! لا توجد تنبيهات حالية")
                }
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-2xl border p-4 ${getAlertColor(alert.level as AlertLevel)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 pt-1">
                    {getAlertIcon(alert.level as AlertLevel)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        alert.level === "critical"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          : alert.level === "warning"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      }`}>
                        {alert.level === "critical"
                          ? t("hoa.alerts.critical", "حرجة")
                          : alert.level === "warning"
                          ? t("hoa.alerts.warning", "تحذير")
                          : t("hoa.alerts.info", "معلومات")
                        }
                      </span>
                      
                      {alert.resolved && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          <FiCheckCircle size={12} className="ml-1" />
                          {t("hoa.alerts.resolved", "تم الحل")}
                        </span>
                      )}
                      
                      {alert.createdAt && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-900 dark:text-white mb-3">
                      {alert.msg}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {alert.link && (
                        <InstantLink 
                          href={alert.link}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white text-sm rounded-lg transition-colors"
                        >
                          {t("hoa.alerts.viewDetails", "عرض التفاصيل")}
                        </InstantLink>
                      )}
                      
                      {!alert.resolved && (
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                        >
                          <FiCheckCircle size={14} />
                          {t("hoa.alerts.markResolved", "تم الحل")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* إحصائيات التنبيهات */}
        {alerts.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">
              {t("hoa.alerts.statistics", "إحصائيات التنبيهات")}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {alerts.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t("hoa.alerts.totalAlerts", "إجمالي التنبيهات")}
                </div>
              </div>
              
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {alerts.filter(a => a.level === "critical").length}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">
                  {t("hoa.alerts.critical", "حرجة")}
                </div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {alerts.filter(a => a.level === "warning").length}
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">
                  {t("hoa.alerts.warnings", "تحذيرات")}
                </div>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {alerts.filter(a => a.resolved).length}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  {t("hoa.alerts.resolved", "تم الحل")}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}