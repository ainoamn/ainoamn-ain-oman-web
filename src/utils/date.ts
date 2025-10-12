export function daysUntil(iso: string): number {
  if (!iso) return NaN;
  
  const now = new Date();
  const target = new Date(iso);
  
  // Reset time part for both dates
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function formatDate(date: Date | string, options: Intl.DateTimeFormatOptions = {}): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    calendar: 'gregory', // ✅ التقويم الميلادي
    numberingSystem: 'latn' // ✅ الأرقام اللاتينية
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('ar', mergedOptions).format(dateObj);
}

export function isDateExpired(date: string): boolean {
  return daysUntil(date) < 0;
}

export function isDateExpiringSoon(date: string, daysThreshold: number = 30): boolean {
  const days = daysUntil(date);
  return days >= 0 && days <= daysThreshold;
}

export function addDaysToDate(date: string, days: number): string {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getMonthName(month: number, locale: string = 'ar'): string {
  const date = new Date();
  date.setMonth(month - 1);
  return date.toLocaleDateString(locale, { 
    month: 'long',
    calendar: 'gregory',
    numberingSystem: 'latn'
  });
}