// src/lib/i18n-helpers.ts
// دوال مساعدة للترجمة - حل مشكلة Objects في React

import { useI18n } from './i18n';

/**
 * تحويل أي قيمة إلى نص قابل للعرض في React
 * يحل مشكلة: Objects are not valid as a React child
 */
export function toText(value: any, lang: 'ar' | 'en' = 'ar'): string {
  if (!value) return '';
  
  // إذا كان string، أرجعه مباشرة
  if (typeof value === 'string') return value;
  
  // إذا كان object مع ar/en
  if (typeof value === 'object' && (value.ar || value.en)) {
    return value[lang] || value.ar || value.en || '';
  }
  
  // إذا كان number
  if (typeof value === 'number') return value.toString();
  
  // أي شيء آخر
  return String(value || '');
}

/**
 * Hook موحد للترجمة - يعمل مع جميع الأنظمة
 */
export function useUnifiedI18n() {
  const i18n = useI18n();
  
  return {
    t: i18n.t,
    lang: i18n.lang,
    dir: i18n.dir,
    setLang: i18n.setLang,
    supported: i18n.supported,
    
    // دالة إضافية لتحويل objects إلى text
    toText: (value: any) => toText(value, i18n.lang),
  };
}

/**
 * تحويل عنوان/وصف property إلى نص
 */
export function getTitleText(title: any, lang: 'ar' | 'en' = 'ar'): string {
  if (!title) return '';
  if (typeof title === 'string') return title;
  if (typeof title === 'object') {
    return title[lang] || title.ar || title.en || '';
  }
  return String(title);
}

/**
 * تحويل وصف property إلى نص
 */
export function getDescriptionText(description: any, lang: 'ar' | 'en' = 'ar'): string {
  return getTitleText(description, lang);
}

/**
 * Hook آمن للترجمة - لن يسبب أخطاء
 */
export function useSafeI18n() {
  try {
    return useI18n();
  } catch (error) {
    // Fallback إذا فشل useI18n
    return {
      t: (key: string, fallback?: string) => fallback || key,
      lang: 'ar' as const,
      dir: 'rtl' as const,
      setLang: () => {},
      supported: ['ar', 'en'] as const,
    };
  }
}

/**
 * تنسيق السعر مع العملة
 */
export function formatPrice(price: number, currency: string = 'OMR'): string {
  const formatted = price.toLocaleString('ar', { calendar: 'gregory', numberingSystem: 'latn' }, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  const currencies: Record<string, string> = {
    OMR: 'ريال',
    AED: 'درهم',
    SAR: 'ريال',
    USD: '$',
  };
  
  return `${formatted} ${currencies[currency] || currency}`;
}

/**
 * تنسيق التاريخ بالعربية
 */
export function formatDate(date: string | Date, lang: 'ar' | 'en' = 'ar'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * تنسيق الوقت
 */
export function formatTime(date: string | Date, lang: 'ar' | 'en' = 'ar'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * تنسيق التاريخ والوقت معاً
 */
export function formatDateTime(date: string | Date, lang: 'ar' | 'en' = 'ar'): string {
  return `${formatDate(date, lang)} ${formatTime(date, lang)}`;
}

