// src/lib/date-time.ts - نظام التاريخ والوقت المحسّن
import { SupportedLang } from './i18n-enhanced';

// تنسيق التاريخ (إنجليزي دائماً)
export function formatDate(
  date: Date | string | number,
  options?: {
    lang?: SupportedLang;
    format?: 'short' | 'medium' | 'long' | 'full';
    includeTime?: boolean;
  }
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const { lang = 'en', format = 'medium', includeTime = false } = options || {};

  // استخدام التاريخ الإنجليزي دائماً
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: format === 'short' ? 'short' : format === 'long' ? 'long' : 'numeric',
    day: 'numeric',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // استخدام 24 ساعة
    }),
  };

  // استخدام locale إنجليزي دائماً للتاريخ
  return new Intl.DateTimeFormat('en-GB', dateOptions).format(dateObj);
}

// تنسيق الوقت (حسب توقيت الدولة)
export function formatTime(
  date: Date | string | number,
  options?: {
    timezone?: string;
    format?: '12h' | '24h';
    includeSeconds?: boolean;
  }
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Time';
  }

  const { timezone, format = '24h', includeSeconds = false } = options || {};

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds && { second: '2-digit' }),
    hour12: format === '12h',
    ...(timezone && { timeZone: timezone }),
  };

  // استخدام locale إنجليزي للوقت
  return new Intl.DateTimeFormat('en-GB', timeOptions).format(dateObj);
}

// تنسيق التاريخ والوقت معاً
export function formatDateTime(
  date: Date | string | number,
  options?: {
    lang?: SupportedLang;
    timezone?: string;
    dateFormat?: 'short' | 'medium' | 'long' | 'full';
    timeFormat?: '12h' | '24h';
  }
): string {
  const dateStr = formatDate(date, {
    lang: options?.lang,
    format: options?.dateFormat,
    includeTime: false,
  });

  const timeStr = formatTime(date, {
    timezone: options?.timezone,
    format: options?.timeFormat,
    includeSeconds: false,
  });

  return `${dateStr} ${timeStr}`;
}

// الحصول على توقيت الدولة من المتصفح
export function getUserTimezone(): string {
  if (typeof window === 'undefined') return 'Asia/Muscat'; // افتراضي عمان
  
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'Asia/Muscat';
  }
}

// تحويل التاريخ إلى توقيت محلي
export function toLocalTime(
  date: Date | string | number,
  timezone?: string
): Date {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;

  if (isNaN(dateObj.getTime())) {
    return new Date();
  }

  const tz = timezone || getUserTimezone();
  
  // تحويل إلى توقيت محلي
  const localDate = new Date(dateObj.toLocaleString('en-US', { timeZone: tz }));
  return localDate;
}

// تنسيق التاريخ النسبي (مثل "منذ ساعتين")
export function formatRelativeTime(
  date: Date | string | number,
  options?: {
    lang?: SupportedLang;
  }
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  const { lang = 'ar' } = options || {};

  // ترجمات بسيطة (يمكن تحسينها)
  const translations: Record<SupportedLang, Record<string, string>> = {
    ar: {
      now: 'الآن',
      seconds: 'ثانية',
      minutes: 'دقيقة',
      hours: 'ساعة',
      days: 'يوم',
      months: 'شهر',
      years: 'سنة',
      ago: 'منذ',
      in: 'في',
    },
    en: {
      now: 'Now',
      seconds: 'second',
      minutes: 'minute',
      hours: 'hour',
      days: 'day',
      months: 'month',
      years: 'year',
      ago: 'ago',
      in: 'in',
    },
    fr: {
      now: 'Maintenant',
      seconds: 'seconde',
      minutes: 'minute',
      hours: 'heure',
      days: 'jour',
      months: 'mois',
      years: 'année',
      ago: 'il y a',
      in: 'dans',
    },
    hi: {
      now: 'अभी',
      seconds: 'सेकंड',
      minutes: 'मिनट',
      hours: 'घंटा',
      days: 'दिन',
      months: 'महीना',
      years: 'साल',
      ago: 'पहले',
      in: 'में',
    },
    ur: {
      now: 'ابھی',
      seconds: 'سیکنڈ',
      minutes: 'منٹ',
      hours: 'گھنٹہ',
      days: 'دن',
      months: 'مہینہ',
      years: 'سال',
      ago: 'پہلے',
      in: 'میں',
    },
    fa: {
      now: 'اکنون',
      seconds: 'ثانیه',
      minutes: 'دقیقه',
      hours: 'ساعت',
      days: 'روز',
      months: 'ماه',
      years: 'سال',
      ago: 'قبل',
      in: 'در',
    },
    zh: {
      now: '现在',
      seconds: '秒',
      minutes: '分钟',
      hours: '小时',
      days: '天',
      months: '月',
      years: '年',
      ago: '前',
      in: '在',
    },
  };

  const t = translations[lang] || translations.en;

  if (seconds < 60) return t.now;
  if (minutes < 60) return `${minutes} ${t.minutes} ${t.ago}`;
  if (hours < 24) return `${hours} ${t.hours} ${t.ago}`;
  if (days < 30) return `${days} ${t.days} ${t.ago}`;
  if (months < 12) return `${months} ${t.months} ${t.ago}`;
  return `${years} ${t.years} ${t.ago}`;
}

// تنسيق التاريخ للعرض في الجداول
export function formatDateForTable(
  date: Date | string | number,
  options?: {
    includeTime?: boolean;
  }
): string {
  return formatDate(date, {
    lang: 'en',
    format: 'short',
    includeTime: options?.includeTime,
  });
}

// تنسيق التاريخ للعرض في التقارير
export function formatDateForReport(
  date: Date | string | number
): string {
  return formatDate(date, {
    lang: 'en',
    format: 'long',
    includeTime: false,
  });
}

// التحقق من صحة التاريخ
export function isValidDate(date: any): boolean {
  if (!date) return false;
  const d = new Date(date);
  return !isNaN(d.getTime());
}

// حساب الفرق بين تاريخين
export function dateDiff(
  date1: Date | string | number,
  date2: Date | string | number,
  unit: 'days' | 'hours' | 'minutes' | 'seconds' = 'days'
): number {
  const d1 = typeof date1 === 'string' || typeof date1 === 'number'
    ? new Date(date1)
    : date1;
  const d2 = typeof date2 === 'string' || typeof date2 === 'number'
    ? new Date(date2)
    : date2;

  const diff = Math.abs(d1.getTime() - d2.getTime());

  switch (unit) {
    case 'seconds':
      return Math.floor(diff / 1000);
    case 'minutes':
      return Math.floor(diff / 60000);
    case 'hours':
      return Math.floor(diff / 3600000);
    case 'days':
    default:
      return Math.floor(diff / 86400000);
  }
}






