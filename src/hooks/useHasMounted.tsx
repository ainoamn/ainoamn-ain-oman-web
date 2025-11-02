import { useEffect, useState } from 'react';

/**
 * Hook لمنع مشاكل Hydration Mismatch
 * يضمن أن المكون لا يعرض محتوى يعتمد على browser APIs حتى يتم mounting على العميل
 */
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}

/**
 * Hook لقراءة localStorage بأمان
 * يمنع hydration mismatch عند قراءة localStorage
 */
export function useSafeLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const hasMounted = useHasMounted();
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    if (!hasMounted) return;
    
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
  }, [key, hasMounted]);

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

/**
 * Hook لعرض تاريخ بأمان
 * يمنع hydration mismatch عند عرض التواريخ
 */
export function useSafeDate(date: string | Date | null | undefined, format: 'short' | 'long' = 'short'): string {
  const hasMounted = useHasMounted();
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    if (!hasMounted || !date) return;
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'UTC',
        ...(format === 'long' 
          ? { year: 'numeric', month: 'long', day: 'numeric' }
          : { year: 'numeric', month: '2-digit', day: '2-digit' }
        )
      };
      setFormattedDate(dateObj.toLocaleDateString('ar-SA', options));
    } catch (error) {
      console.error('Error formatting date:', error);
      setFormattedDate('');
    }
  }, [date, format, hasMounted]);

  return formattedDate;
}

/**
 * Component wrapper لمنع hydration mismatch
 * يعرض loading state حتى يتم mounting على العميل
 */
export function ClientOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const hasMounted = useHasMounted();

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

