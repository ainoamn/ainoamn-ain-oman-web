import React from 'react';
import FeatureGuard from '@/components/FeatureGuard';
import { useFeatureAccessMultiple } from '@/hooks/useFeatureAccess';
import {
  FaChartLine,
  FaTasks,
  FaFileInvoiceDollar,
  FaTools,
  FaBalanceScale,
  FaHandHoldingUsd,
  FaBell,
  FaComments,
  FaBrain,
  FaCalendarAlt,
  FaFileContract,
  FaClipboardList,
} from 'react-icons/fa';
import { FiLock } from 'react-icons/fi';

export interface TabDefinition {
  id: string;
  label: string;
  icon: any;
  featureId: string; // ربط بنظام الصلاحيات
}

// تعريف جميع التبويبات مع الصلاحيات المطلوبة
export const PROPERTY_ADMIN_TABS: TabDefinition[] = [
  { 
    id: 'overview', 
    label: 'نظرة عامة', 
    icon: FaChartLine,
    featureId: 'OVERVIEW'
  },
  { 
    id: 'tasks', 
    label: 'المهام', 
    icon: FaTasks,
    featureId: 'TASKS_VIEW'
  },
  { 
    id: 'rentals', 
    label: 'عقود الإيجار', 
    icon: FaHandHoldingUsd,
    featureId: 'LEASES_VIEW'
  },
  { 
    id: 'invoices', 
    label: 'الفواتير والمدفوعات', 
    icon: FaFileInvoiceDollar,
    featureId: 'INVOICES_VIEW'
  },
  { 
    id: 'maintenance', 
    label: 'الصيانة', 
    icon: FaTools,
    featureId: 'MAINTENANCE_VIEW'
  },
  { 
    id: 'legal', 
    label: 'الشؤون القانونية', 
    icon: FaBalanceScale,
    featureId: 'LEGAL_VIEW'
  },
  { 
    id: 'contracts', 
    label: 'العقود', 
    icon: FaFileContract,
    featureId: 'CONTRACTS_VIEW'
  },
  { 
    id: 'requests', 
    label: 'الطلبات', 
    icon: FaClipboardList,
    featureId: 'REQUESTS_VIEW'
  },
  { 
    id: 'calendar', 
    label: 'التقويم', 
    icon: FaCalendarAlt,
    featureId: 'CALENDAR_VIEW'
  },
  { 
    id: 'alerts', 
    label: 'التنبيهات', 
    icon: FaBell,
    featureId: 'ALERTS_VIEW'
  },
  { 
    id: 'reviews', 
    label: 'التقييمات', 
    icon: FaComments,
    featureId: 'REVIEWS_VIEW'
  },
  { 
    id: 'ai', 
    label: 'التنبؤات والذكاء', 
    icon: FaBrain,
    featureId: 'AI_ANALYTICS'
  },
];

interface PropertyAdminTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

/**
 * مكون التبويبات مع التحقق من الصلاحيات
 */
export default function PropertyAdminTabs({ activeTab, onTabChange }: PropertyAdminTabsProps) {
  // التحقق من الصلاحيات لجميع التبويبات
  const featureIds = PROPERTY_ADMIN_TABS.map(tab => tab.featureId);
  const { accessMap, isLoading } = useFeatureAccessMultiple(featureIds);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // فلترة التبويبات المتاحة
  const availableTabs = PROPERTY_ADMIN_TABS.filter(tab => accessMap[tab.featureId]);
  const lockedTabs = PROPERTY_ADMIN_TABS.filter(tab => !accessMap[tab.featureId]);

  return (
    <div>
      {/* التبويبات المتاحة */}
      <div className="flex flex-wrap gap-2 mb-6">
        {availableTabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }
              `}
            >
              <IconComponent className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* التبويبات المقفلة */}
      {lockedTabs.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <FiLock className="w-5 h-5 text-orange-600 mt-0.5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-2">
                ميزات إضافية متاحة مع الترقية
              </h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {lockedTabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <span
                      key={tab.id}
                      className="inline-flex items-center gap-1.5 bg-white border border-yellow-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                    >
                      <IconComponent className="w-3.5 h-3.5 text-gray-500" />
                      {tab.label}
                      <FiLock className="w-3 h-3 text-orange-500" />
                    </span>
                  );
                })}
              </div>
              <a
                href="/subscriptions"
                className="inline-block bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:from-green-700 hover:to-blue-700 transition-all"
              >
                اكتشف الباقات المتاحة →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Wrapper لمحتوى التبويب مع التحقق من الصلاحية
 */
interface TabContentWrapperProps {
  tabId: string;
  children: React.ReactNode;
}

export function TabContentWrapper({ tabId, children }: TabContentWrapperProps) {
  const tab = PROPERTY_ADMIN_TABS.find(t => t.id === tabId);
  
  if (!tab) {
    return <>{children}</>;
  }

  return (
    <FeatureGuard 
      featureId={tab.featureId} 
      mode="lock"
      showUpgrade={true}
    >
      {children}
    </FeatureGuard>
  );
}

