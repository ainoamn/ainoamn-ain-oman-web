// src/server/features/store.ts - مخزن الميزات والتحكم
import { FeatureConfig, FeatureOverride, FeatureUsage, FeatureStats, FeatureId, UserRole } from '@/types/features';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), '.data');
const FEATURES_FILE = join(DATA_DIR, 'features.json');
const OVERRIDES_FILE = join(DATA_DIR, 'feature-overrides.json');
const USAGE_FILE = join(DATA_DIR, 'feature-usage.json');

// تهيئة الملفات
async function ensureFiles() {
  try {
    await readFile(FEATURES_FILE);
  } catch {
    const defaultFeatures = await getDefaultFeatures();
    await writeFile(FEATURES_FILE, JSON.stringify(defaultFeatures, null, 2));
  }
  try {
    await readFile(OVERRIDES_FILE);
  } catch {
    await writeFile(OVERRIDES_FILE, JSON.stringify([], null, 2));
  }
  try {
    await readFile(USAGE_FILE);
  } catch {
    await writeFile(USAGE_FILE, JSON.stringify([], null, 2));
  }
}

// الميزات الافتراضية
async function getDefaultFeatures(): Promise<FeatureConfig[]> {
  const now = Date.now();
  const defaultUserId = 'system';
  
  return [
    {
      id: 'ratings',
      name: 'نظام التقييمات',
      description: 'نظام التقييمات المتقدم للمستخدمين والعقارات',
      enabled: true,
      scope: 'global',
      metadata: { category: 'core', priority: 1 },
      createdAt: now,
      updatedAt: now,
      createdBy: defaultUserId,
      updatedBy: defaultUserId,
    },
    {
      id: 'marketer_points',
      name: 'نظام نقاط المسوقين',
      description: 'نظام المكافآت والنقاط للمسوقين',
      enabled: true,
      scope: 'global',
      metadata: { category: 'marketing', priority: 2 },
      createdAt: now,
      updatedAt: now,
      createdBy: defaultUserId,
      updatedBy: defaultUserId,
    },
    {
      id: 'flexible_rental',
      name: 'الإيجار المرن',
      description: 'دعم الإيجار اليومي والأسبوعي والشهري والسنوي',
      enabled: true,
      scope: 'global',
      metadata: { category: 'rental', priority: 1 },
      createdAt: now,
      updatedAt: now,
      createdBy: defaultUserId,
      updatedBy: defaultUserId,
    },
    {
      id: 'ai_insights',
      name: 'رؤى الذكاء الاصطناعي',
      description: 'تحليلات وتوصيات ذكية للعقارات',
      enabled: true,
      scope: 'global',
      metadata: { category: 'ai', priority: 1 },
      createdAt: now,
      updatedAt: now,
      createdBy: defaultUserId,
      updatedBy: defaultUserId,
    },
    {
      id: 'ai_chatbot',
      name: 'شات بوت الذكاء الاصطناعي',
      description: 'مساعد ذكي للرد على الاستفسارات',
      enabled: true,
      scope: 'global',
      metadata: { category: 'ai', priority: 2 },
      createdAt: now,
      updatedAt: now,
      createdBy: defaultUserId,
      updatedBy: defaultUserId,
    },
    {
      id: 'multi_language',
      name: 'متعدد اللغات',
      description: 'دعم 7 لغات (عربي، إنجليزي، فرنسي، هندي، أوردو، فارسي، صيني)',
      enabled: true,
      scope: 'global',
      metadata: { category: 'core', priority: 1 },
      createdAt: now,
      updatedAt: now,
      createdBy: defaultUserId,
      updatedBy: defaultUserId,
    },
    {
      id: 'multi_currency',
      name: 'متعدد العملات',
      description: 'دعم 7 عملات (ريال عماني، درهم إماراتي، ريال سعودي، دينار بحريني، دينار كويتي، ريال قطري، دولار أمريكي)',
      enabled: true,
      scope: 'global',
      metadata: { category: 'core', priority: 1 },
      createdAt: now,
      updatedAt: now,
      createdBy: defaultUserId,
      updatedBy: defaultUserId,
    },
  ];
}

// قراءة جميع الميزات
export async function getAllFeatures(): Promise<FeatureConfig[]> {
  await ensureFiles();
  const data = await readFile(FEATURES_FILE, 'utf-8');
  return JSON.parse(data || '[]');
}

// قراءة ميزة محددة
export async function getFeature(featureId: FeatureId): Promise<FeatureConfig | null> {
  const features = await getAllFeatures();
  return features.find(f => f.id === featureId) || null;
}

// حفظ ميزة
export async function saveFeature(feature: FeatureConfig): Promise<FeatureConfig> {
  await ensureFiles();
  const features = await getAllFeatures();
  const index = features.findIndex(f => f.id === feature.id);
  
  if (index >= 0) {
    features[index] = { ...feature, updatedAt: Date.now() };
  } else {
    features.push({ ...feature, createdAt: Date.now(), updatedAt: Date.now() });
  }
  
  await writeFile(FEATURES_FILE, JSON.stringify(features, null, 2));
  return feature;
}

// حذف ميزة
export async function deleteFeature(featureId: FeatureId): Promise<boolean> {
  await ensureFiles();
  const features = await getAllFeatures();
  const filtered = features.filter(f => f.id !== featureId);
  
  if (filtered.length === features.length) return false;
  
  await writeFile(FEATURES_FILE, JSON.stringify(filtered, null, 2));
  return true;
}

// التحقق من تفعيل ميزة
export async function isFeatureEnabled(
  featureId: FeatureId,
  context?: {
    userId?: string;
    userRole?: UserRole;
    propertyId?: string;
    organizationId?: string;
    country?: string;
    subscription?: string;
  }
): Promise<boolean> {
  const feature = await getFeature(featureId);
  if (!feature) return false;
  
  // إذا كانت معطلة عالمياً
  if (!feature.enabled && feature.scope === 'global') return false;
  
  // التحقق من Overrides
  const overrides = await getOverrides();
  const relevantOverride = overrides.find(
    o => o.featureId === featureId && 
    (
      (o.scope === 'user' && o.targetId === context?.userId) ||
      (o.scope === 'role' && o.targetId === context?.userRole) ||
      (o.scope === 'property' && o.targetId === context?.propertyId)
    )
  );
  
  if (relevantOverride) {
    // التحقق من انتهاء الصلاحية
    if (relevantOverride.expiresAt && relevantOverride.expiresAt < Date.now()) {
      // Override منتهي، نستخدم إعدادات الميزة
    } else {
      return relevantOverride.enabled;
    }
  }
  
  // التحقق من الشروط
  if (feature.conditions) {
    const { conditions } = feature;
    
    // التحقق من الأدوار
    if (conditions.allowedRoles && context?.userRole) {
      if (!conditions.allowedRoles.includes(context.userRole)) return false;
    }
    if (conditions.blockedRoles && context?.userRole) {
      if (conditions.blockedRoles.includes(context.userRole)) return false;
    }
    
    // التحقق من الاشتراك
    if (conditions.minSubscription && context?.subscription) {
      // يمكن إضافة منطق مقارنة الاشتراكات
    }
    
    // التحقق من البلد
    if (conditions.allowedCountries && context?.country) {
      if (!conditions.allowedCountries.includes(context.country)) return false;
    }
    if (conditions.blockedCountries && context?.country) {
      if (conditions.blockedCountries.includes(context.country)) return false;
    }
    
    // التحقق من التاريخ
    const now = Date.now();
    if (conditions.dateFrom && now < conditions.dateFrom) return false;
    if (conditions.dateTo && now > conditions.dateTo) return false;
  }
  
  return feature.enabled;
}

// إدارة Overrides
export async function getOverrides(): Promise<FeatureOverride[]> {
  await ensureFiles();
  const data = await readFile(OVERRIDES_FILE, 'utf-8');
  return JSON.parse(data || '[]');
}

export async function createOverride(override: Omit<FeatureOverride, 'id' | 'createdAt'>): Promise<FeatureOverride> {
  await ensureFiles();
  const overrides = await getOverrides();
  
  const newOverride: FeatureOverride = {
    ...override,
    id: `override-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
  };
  
  overrides.push(newOverride);
  await writeFile(OVERRIDES_FILE, JSON.stringify(overrides, null, 2));
  
  return newOverride;
}

export async function deleteOverride(overrideId: string): Promise<boolean> {
  await ensureFiles();
  const overrides = await getOverrides();
  const filtered = overrides.filter(o => o.id !== overrideId);
  
  if (filtered.length === overrides.length) return false;
  
  await writeFile(OVERRIDES_FILE, JSON.stringify(filtered, null, 2));
  return true;
}

// تتبع الاستخدام
export async function logFeatureUsage(usage: Omit<FeatureUsage, 'timestamp'>): Promise<void> {
  await ensureFiles();
  const usages = await getUsage();
  usages.push({
    ...usage,
    timestamp: Date.now(),
  });
  
  // الاحتفاظ بآخر 10000 استخدام فقط
  if (usages.length > 10000) {
    usages.splice(0, usages.length - 10000);
  }
  
  await writeFile(USAGE_FILE, JSON.stringify(usages, null, 2));
}

export async function getUsage(featureId?: FeatureId): Promise<FeatureUsage[]> {
  await ensureFiles();
  const data = await readFile(USAGE_FILE, 'utf-8');
  const usages: FeatureUsage[] = JSON.parse(data || '[]');
  
  if (featureId) {
    return usages.filter(u => u.featureId === featureId);
  }
  
  return usages;
}

// إحصائيات الميزات
export async function getFeatureStats(featureId: FeatureId): Promise<FeatureStats> {
  const usages = await getUsage(featureId);
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const recentUsages = usages.filter(u => u.timestamp >= oneDayAgo);
  
  const uniqueUsers = new Set(usages.map(u => u.userId).filter(Boolean)).size;
  const userCounts = new Map<string, number>();
  
  usages.forEach(u => {
    if (u.userId) {
      userCounts.set(u.userId, (userCounts.get(u.userId) || 0) + 1);
    }
  });
  
  const topUsers = Array.from(userCounts.entries())
    .map(([userId, count]) => ({ userId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return {
    featureId,
    totalUsage: usages.length,
    uniqueUsers,
    lastUsed: usages.length > 0 ? Math.max(...usages.map(u => u.timestamp)) : undefined,
    averageUsagePerDay: recentUsages.length,
    topUsers,
    errors: 0, // يمكن تتبع الأخطاء بشكل منفصل
    successRate: 1, // يمكن حساب معدل النجاح
  };
}






