// src/components/common/FeatureGuard.tsx - حارس الميزات (للأكواد البرمجية)
import { FeatureId } from '@/types/features';

let featureCache: Record<string, boolean> = {};
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق

export async function checkFeature(
  featureId: FeatureId,
  context?: {
    userId?: string;
    userRole?: string;
    propertyId?: string;
  }
): Promise<boolean> {
  const cacheKey = `${featureId}-${JSON.stringify(context)}`;
  const now = Date.now();

  // التحقق من الـ cache
  if (now - cacheTimestamp < CACHE_DURATION && featureCache[cacheKey] !== undefined) {
    return featureCache[cacheKey];
  }

  try {
    const response = await fetch('/api/features/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featureId, context }),
    });

    if (response.ok) {
      const data = await response.json();
      featureCache[cacheKey] = data.enabled;
      cacheTimestamp = now;
      return data.enabled;
    }
  } catch (error) {
    console.error('Error checking feature:', error);
  }

  // افتراضي: معطل
  featureCache[cacheKey] = false;
  return false;
}

// دالة مساعدة للاستخدام في Server Components
export async function getFeatureStatus(
  featureId: FeatureId,
  context?: {
    userId?: string;
    userRole?: string;
    propertyId?: string;
  }
): Promise<boolean> {
  // في Server Components، يمكن استيراد store مباشرة
  try {
    const { isFeatureEnabled } = await import('@/server/features/store');
    return await isFeatureEnabled(featureId, context);
  } catch {
    return false;
  }
}

// مسح الـ cache
export function clearFeatureCache() {
  featureCache = {};
  cacheTimestamp = 0;
}






