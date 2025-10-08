// src/hooks/useInstantData.ts
// Hook للبيانات الفورية مع التخزين المؤقت الذكي
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInstantDataOptions<T> {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  dedupingInterval?: number; // بالمللي ثانية
  focusThrottleInterval?: number;
  errorRetryCount?: number;
  errorRetryInterval?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  fallbackData?: T;
}

interface UseInstantDataReturn<T> {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isValidating: boolean;
  mutate: (newData?: T, revalidate?: boolean) => Promise<void>;
  revalidate: () => Promise<void>;
}

// Cache عالمي للبيانات
const globalCache = new Map<string, any>();
const cacheTimestamps = new Map<string, number>();
const ongoingRequests = new Map<string, Promise<any>>();

/**
 * useInstantData - Hook للبيانات الفورية بسرعة البرق ⚡
 * 
 * مشابه لـ SWR ولكن مدمج مباشرة بدون dependencies إضافية
 * 
 * @example
 * ```tsx
 * const { data, error, isLoading } = useInstantData('/api/properties', fetcher);
 * ```
 */
export function useInstantData<T = any>(
  key: string | null,
  fetcher: (key: string) => Promise<T>,
  options: UseInstantDataOptions<T> = {}
): UseInstantDataReturn<T> {
  const {
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    dedupingInterval = 2000,
    focusThrottleInterval = 5000,
    errorRetryCount = 3,
    errorRetryInterval = 5000,
    onSuccess,
    onError,
    fallbackData,
  } = options;

  const [data, setData] = useState<T | undefined>(
    key ? globalCache.get(key) || fallbackData : fallbackData
  );
  const [error, setError] = useState<Error | undefined>();
  const [isLoading, setIsLoading] = useState(!data);
  const [isValidating, setIsValidating] = useState(false);

  const retryCountRef = useRef(0);
  const lastFocusRevalidationRef = useRef(0);
  const isMountedRef = useRef(true);

  // Fetcher مع deduplication
  const fetchData = useCallback(
    async (shouldSetLoading = true): Promise<T | undefined> => {
      if (!key) return undefined;

      // تحقق من وجود طلب جاري
      const now = Date.now();
      const lastCacheTime = cacheTimestamps.get(key) || 0;

      // إذا كان هناك cache حديث (خلال dedupingInterval)
      if (now - lastCacheTime < dedupingInterval) {
        const cachedData = globalCache.get(key);
        if (cachedData !== undefined) {
          return cachedData;
        }
      }

      // إذا كان هناك طلب جاري، انتظره
      if (ongoingRequests.has(key)) {
        return ongoingRequests.get(key);
      }

      // إنشاء طلب جديد
      if (shouldSetLoading && !data) {
        setIsLoading(true);
      }
      setIsValidating(true);
      setError(undefined);

      const request = fetcher(key)
        .then((newData) => {
          if (isMountedRef.current) {
            setData(newData);
            setError(undefined);
            setIsLoading(false);
            setIsValidating(false);
            
            // حفظ في الـ cache
            globalCache.set(key, newData);
            cacheTimestamps.set(key, Date.now());
            
            // reset retry count
            retryCountRef.current = 0;
            
            onSuccess?.(newData);
          }
          return newData;
        })
        .catch((err) => {
          if (isMountedRef.current) {
            setError(err);
            setIsLoading(false);
            setIsValidating(false);
            
            onError?.(err);

            // إعادة المحاولة
            if (retryCountRef.current < errorRetryCount) {
              retryCountRef.current++;
              setTimeout(() => {
                fetchData(false);
              }, errorRetryInterval);
            }
          }
          throw err;
        })
        .finally(() => {
          ongoingRequests.delete(key);
        });

      ongoingRequests.set(key, request);
      return request;
    },
    [key, fetcher, dedupingInterval, errorRetryCount, errorRetryInterval, data, onSuccess, onError]
  );

  // تحميل البيانات عند التركيب أو تغيير الـ key
  useEffect(() => {
    isMountedRef.current = true;

    if (!key) {
      setIsLoading(false);
      return;
    }

    // تحقق من الـ cache أولاً
    const cachedData = globalCache.get(key);
    if (cachedData !== undefined) {
      setData(cachedData);
      setIsLoading(false);
      // لا تزال نقوم بـ revalidate في الخلفية
      fetchData(false);
    } else {
      fetchData();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [key, fetchData]);

  // Revalidate عند التركيز
  useEffect(() => {
    if (!revalidateOnFocus || !key) return;

    const handleFocus = () => {
      const now = Date.now();
      if (now - lastFocusRevalidationRef.current > focusThrottleInterval) {
        lastFocusRevalidationRef.current = now;
        fetchData(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [revalidateOnFocus, key, focusThrottleInterval, fetchData]);

  // Revalidate عند إعادة الاتصال
  useEffect(() => {
    if (!revalidateOnReconnect || !key) return;

    const handleOnline = () => {
      fetchData(false);
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [revalidateOnReconnect, key, fetchData]);

  // Mutate - تحديث البيانات يدويًا
  const mutate = useCallback(
    async (newData?: T, revalidate = true) => {
      if (!key) return;

      if (newData !== undefined) {
        setData(newData);
        globalCache.set(key, newData);
        cacheTimestamps.set(key, Date.now());
      }

      if (revalidate) {
        await fetchData(false);
      }
    },
    [key, fetchData]
  );

  // Revalidate - إعادة تحميل البيانات
  const revalidate = useCallback(async () => {
    await fetchData(false);
  }, [fetchData]);

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    revalidate,
  };
}

/**
 * preloadData - تحميل البيانات مسبقًا
 */
export function preloadData<T>(
  key: string,
  fetcher: (key: string) => Promise<T>
): Promise<T> {
  // إذا كانت البيانات موجودة في الـ cache
  if (globalCache.has(key)) {
    return Promise.resolve(globalCache.get(key));
  }

  // إذا كان هناك طلب جاري
  if (ongoingRequests.has(key)) {
    return ongoingRequests.get(key)!;
  }

  // إنشاء طلب جديد
  const request = fetcher(key).then((data) => {
    globalCache.set(key, data);
    cacheTimestamps.set(key, Date.now());
    return data;
  });

  ongoingRequests.set(key, request);
  return request;
}

/**
 * clearCache - مسح الـ cache
 */
export function clearCache(key?: string) {
  if (key) {
    globalCache.delete(key);
    cacheTimestamps.delete(key);
  } else {
    globalCache.clear();
    cacheTimestamps.clear();
  }
}

/**
 * getCacheSize - الحصول على حجم الـ cache
 */
export function getCacheSize() {
  return globalCache.size;
}


