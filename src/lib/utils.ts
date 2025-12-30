// src/lib/utils.ts - دوال مساعدة شاملة
import { SupportedLang } from './i18n-enhanced';
import { SupportedCurrency } from '@/context/CurrencyContext-enhanced';
import { formatDate, formatTime, formatDateTime, formatRelativeTime } from './date-time';

// دالة الترجمة السريعة
export function t(key: string, fallback?: string, vars?: Record<string, string | number>): string {
  if (typeof window === 'undefined') return fallback || key;
  
  try {
    const { useI18n } = require('@/lib/i18n-enhanced');
    // في المكونات، استخدم useI18n hook
    return fallback || key;
  } catch {
    return fallback || key;
  }
}

// دالة تنسيق المبلغ
export function formatMoney(
  amount: number,
  currency?: SupportedCurrency,
  lang?: SupportedLang
): string {
  if (typeof window === 'undefined') {
    return `${amount.toFixed(3)} ر.ع`;
  }
  
  try {
    const { useCurrency } = require('@/context/CurrencyContext-enhanced');
    // في المكونات، استخدم useCurrency hook
    return `${amount.toFixed(3)} ر.ع`;
  } catch {
    return `${amount.toFixed(3)} ر.ع`;
  }
}

// دالة تنسيق التاريخ
export function formatDateLocal(
  date: Date | string | number,
  options?: {
    lang?: SupportedLang;
    format?: 'short' | 'medium' | 'long' | 'full';
    includeTime?: boolean;
  }
): string {
  return formatDate(date, options);
}

// دالة تنسيق الوقت
export function formatTimeLocal(
  date: Date | string | number,
  options?: {
    timezone?: string;
    format?: '12h' | '24h';
    includeSeconds?: boolean;
  }
): string {
  return formatTime(date, options);
}

// دالة تنسيق التاريخ والوقت
export function formatDateTimeLocal(
  date: Date | string | number,
  options?: {
    lang?: SupportedLang;
    timezone?: string;
    dateFormat?: 'short' | 'medium' | 'long' | 'full';
    timeFormat?: '12h' | '24h';
  }
): string {
  return formatDateTime(date, options);
}

// دالة التاريخ النسبي
export function formatRelativeDate(
  date: Date | string | number,
  lang?: SupportedLang
): string {
  return formatRelativeTime(date, { lang });
}

// دالة التحقق من اللغة RTL
export function isRTL(lang?: SupportedLang): boolean {
  if (typeof window === 'undefined') return true;
  
  const currentLang = lang || (localStorage.getItem('locale') as SupportedLang) || 'ar';
  return ['ar', 'ur', 'fa'].includes(currentLang);
}

// دالة الحصول على الاتجاه
export function getDirection(lang?: SupportedLang): 'rtl' | 'ltr' {
  return isRTL(lang) ? 'rtl' : 'ltr';
}






