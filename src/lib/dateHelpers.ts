// src/lib/dateHelpers.ts
// دوال مساعدة للتاريخ الميلادي ⚡

/**
 * تنسيق التاريخ بالتقويم الميلادي (Gregorian)
 * @param date - التاريخ (string أو Date)
 * @param format - التنسيق: 'short' | 'long' | 'full'
 * @returns التاريخ منسق بالميلادي
 */
export function formatDate(date: string | Date | undefined | null, format: 'short' | 'long' | 'full' = 'long'): string {
  if (!date) return '-';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(d.getTime())) return '-';
    
    // استخدام التقويم الميلادي (Gregorian) مع اللغة العربية
    const options: Intl.DateTimeFormatOptions = {
      calendar: 'gregory', // ✅ التقويم الميلادي
      numberingSystem: 'latn', // ✅ الأرقام اللاتينية (1,2,3 بدلاً من ١,٢,٣)
    };
    
    if (format === 'short') {
      options.year = 'numeric';
      options.month = '2-digit';
      options.day = '2-digit';
    } else if (format === 'long') {
      options.year = 'numeric';
      options.month = 'long';
      options.day = 'numeric';
    } else if (format === 'full') {
      options.year = 'numeric';
      options.month = 'long';
      options.day = 'numeric';
      options.weekday = 'long';
    }
    
    return d.toLocaleDateString('ar', options);
  } catch {
    return String(date);
  }
}

/**
 * تنسيق التاريخ والوقت بالتقويم الميلادي
 */
export function formatDateTime(date: string | Date | undefined | null): string {
  if (!date) return '-';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(d.getTime())) return '-';
    
    return d.toLocaleString('ar', {
      calendar: 'gregory',
      numberingSystem: 'latn',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return String(date);
  }
}

/**
 * تنسيق التاريخ بصيغة قصيرة (DD/MM/YYYY)
 */
export function formatDateShort(date: string | Date | undefined | null): string {
  if (!date) return '-';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(d.getTime())) return '-';
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch {
    return String(date);
  }
}

/**
 * تنسيق الوقت فقط
 */
export function formatTime(date: string | Date | undefined | null): string {
  if (!date) return '-';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(d.getTime())) return '-';
    
    return d.toLocaleTimeString('ar', {
      numberingSystem: 'latn',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return String(date);
  }
}

/**
 * الحصول على التاريخ الحالي بصيغة YYYY-MM-DD
 */
export function getTodayISO(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * حساب الفرق بين تاريخين بالأيام
 */
export function daysBetween(date1: string | Date, date2: string | Date): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  const diff = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * التحقق من أن التاريخ في المستقبل
 */
export function isFuture(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() > Date.now();
}

/**
 * التحقق من أن التاريخ في الماضي
 */
export function isPast(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() < Date.now();
}

