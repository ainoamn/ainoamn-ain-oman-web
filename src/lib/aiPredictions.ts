// src/lib/aiPredictions.ts
// نظام التنبؤات الذكية بناءً على سلوك المستخدم
import { UserRole } from './userRoles';

export interface UserBehavior {
  userId: string;
  role: UserRole;
  lastLogin: Date;
  pageViews: Record<string, number>;
  actions: Array<{
    type: string;
    timestamp: Date;
    data?: any;
  }>;
  preferences: Record<string, any>;
}

export interface Prediction {
  id: string;
  type: 'opportunity' | 'warning' | 'recommendation' | 'trend';
  title: string;
  description: string;
  confidence: number; // 0-100
  impact: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  actionLabel?: string;
  data?: any;
  createdAt: Date;
  expiresAt?: Date;
}

class AIPredictionEngine {
  /**
   * توليد تنبؤات ذكية بناءً على سلوك المستخدم
   */
  async generatePredictions(
    behavior: UserBehavior,
    stats: any
  ): Promise<Prediction[]> {
    const predictions: Prediction[] = [];

    // تحليل سلوك المستخدم
    const analysis = this.analyzeBehavior(behavior, stats);

    // تنبؤات بناءً على الدور
    if (behavior.role === 'property_owner') {
      predictions.push(...this.getOwnerPredictions(analysis, stats));
    } else if (behavior.role === 'tenant') {
      predictions.push(...this.getTenantPredictions(analysis, stats));
    } else if (behavior.role === 'admin') {
      predictions.push(...this.getAdminPredictions(analysis, stats));
    }

    // تنبؤات عامة
    predictions.push(...this.getGeneralPredictions(analysis, stats));

    return predictions.sort((a, b) => {
      // ترتيب حسب الأهمية والثقة
      const impactWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      const aScore = impactWeight[a.impact] * (a.confidence / 100);
      const bScore = impactWeight[b.impact] * (b.confidence / 100);
      return bScore - aScore;
    });
  }

  private analyzeBehavior(behavior: UserBehavior, stats: any) {
    const daysSinceLastLogin = Math.floor(
      (Date.now() - behavior.lastLogin.getTime()) / (1000 * 60 * 60 * 24)
    );

    const mostViewedPage = Object.entries(behavior.pageViews).sort(
      ([, a], [, b]) => (b as number) - (a as number)
    )[0]?.[0];

    const actionFrequency = behavior.actions.reduce((acc, action) => {
      acc[action.type] = (acc[action.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      daysSinceLastLogin,
      mostViewedPage,
      actionFrequency,
      totalActions: behavior.actions.length,
      isActive: daysSinceLastLogin < 7,
      isVeryActive: daysSinceLastLogin < 3
    };
  }

  private getOwnerPredictions(analysis: any, stats: any): Prediction[] {
    const predictions: Prediction[] = [];

    // تنبؤ بناءً على عدد العقارات
    if (stats.properties?.total > 0 && stats.properties.total < 5) {
      predictions.push({
        id: 'owner_expand',
        type: 'opportunity',
        title: 'فرصة للتوسع',
        description: `لديك ${stats.properties.total} عقار. بناءً على سلوكك، قد تستفيد من إضافة المزيد من العقارات لزيادة الإيرادات.`,
        confidence: 75,
        impact: 'medium',
        actionUrl: '/properties/new',
        actionLabel: 'إضافة عقار جديد',
        createdAt: new Date()
      });
    }

    // تنبؤ بناءً على العقود المنتهية
    if (stats.rentals?.expiringSoon > 0) {
      predictions.push({
        id: 'owner_renew',
        type: 'warning',
        title: 'عقود قريبة من الانتهاء',
        description: `لديك ${stats.rentals.expiringSoon} عقد سينتهي قريباً. نوصي بالبدء في تجديدها الآن.`,
        confidence: 90,
        impact: 'high',
        actionUrl: '/dashboard/property-owner?tab=contracts',
        actionLabel: 'عرض العقود',
        createdAt: new Date()
      });
    }

    // تنبؤ بناءً على الإيرادات
    if (stats.revenue?.monthly && stats.revenue.monthly > 0) {
      const avgRevenuePerProperty = stats.revenue.monthly / (stats.properties?.total || 1);
      if (avgRevenuePerProperty < 500) {
        predictions.push({
          id: 'owner_optimize',
          type: 'recommendation',
          title: 'تحسين الإيرادات',
          description: `متوسط الإيرادات لكل عقار منخفض. نوصي بمراجعة الأسعار وتحسين الخدمات.`,
          confidence: 65,
          impact: 'medium',
          actionUrl: '/dashboard/property-owner?tab=properties',
          actionLabel: 'مراجعة العقارات',
          createdAt: new Date()
        });
      }
    }

    return predictions;
  }

  private getTenantPredictions(analysis: any, stats: any): Prediction[] {
    const predictions: Prediction[] = [];

    // تنبؤ بناءً على انتهاء العقد
    if (stats.rentals?.expiringSoon > 0) {
      predictions.push({
        id: 'tenant_renew',
        type: 'warning',
        title: 'عقدك سينتهي قريباً',
        description: `عقدك سينتهي خلال ${stats.rentals.daysUntilExpiry} يوم. نوصي بالتواصل مع المالك لتجديد العقد.`,
        confidence: 95,
        impact: 'high',
        actionUrl: '/dashboard/tenant?tab=contracts',
        actionLabel: 'عرض العقد',
        createdAt: new Date()
      });
    }

    // تنبؤ بناءً على سلوك البحث
    if (analysis.mostViewedPage === '/properties') {
      predictions.push({
        id: 'tenant_search',
        type: 'opportunity',
        title: 'تبحث عن عقار جديد؟',
        description: 'لاحظنا أنك تتصفح العقارات. هل تبحث عن عقار جديد؟',
        confidence: 70,
        impact: 'low',
        actionUrl: '/properties',
        actionLabel: 'تصفح العقارات',
        createdAt: new Date()
      });
    }

    return predictions;
  }

  private getAdminPredictions(analysis: any, stats: any): Prediction[] {
    const predictions: Prediction[] = [];

    // تنبؤ بناءً على النمو
    if (stats.users?.growth && stats.users.growth > 20) {
      predictions.push({
        id: 'admin_growth',
        type: 'trend',
        title: 'نمو قوي في المستخدمين',
        description: `عدد المستخدمين زاد بنسبة ${stats.users.growth}% هذا الشهر. هذا مؤشر إيجابي!`,
        confidence: 85,
        impact: 'medium',
        actionUrl: '/dashboard/admin?tab=users',
        actionLabel: 'عرض المستخدمين',
        createdAt: new Date()
      });
    }

    // تنبؤ بناءً على المهام المتأخرة
    if (stats.tasks?.overdue > 0) {
      predictions.push({
        id: 'admin_tasks',
        type: 'warning',
        title: 'مهام متأخرة',
        description: `لديك ${stats.tasks.overdue} مهمة متأخرة تحتاج إلى متابعة.`,
        confidence: 100,
        impact: 'high',
        actionUrl: '/dashboard/admin?tab=tasks',
        actionLabel: 'عرض المهام',
        createdAt: new Date()
      });
    }

    return predictions;
  }

  private getGeneralPredictions(analysis: any, stats: any): Prediction[] {
    const predictions: Prediction[] = [];

    // تنبؤ بناءً على النشاط
    if (!analysis.isActive) {
      predictions.push({
        id: 'general_inactive',
        type: 'recommendation',
        title: 'مرحباً بعودتك!',
        description: `لم تسجل دخول منذ ${analysis.daysSinceLastLogin} يوم. هناك تحديثات جديدة قد تهمك.`,
        confidence: 60,
        impact: 'low',
        createdAt: new Date()
      });
    }

    return predictions;
  }

  /**
   * تتبع سلوك المستخدم
   */
  trackUserAction(
    userId: string,
    actionType: string,
    data?: any
  ): void {
    // في التطبيق الحقيقي، سيتم إرسال هذا إلى API
    if (typeof window !== 'undefined') {
      const behavior = this.getUserBehavior(userId);
      behavior.actions.push({
        type: actionType,
        timestamp: new Date(),
        data
      });
      this.saveUserBehavior(userId, behavior);
    }
  }

  /**
   * تتبع عرض الصفحة
   */
  trackPageView(userId: string, page: string): void {
    if (typeof window !== 'undefined') {
      const behavior = this.getUserBehavior(userId);
      behavior.pageViews[page] = (behavior.pageViews[page] || 0) + 1;
      this.saveUserBehavior(userId, behavior);
    }
  }

  private getUserBehavior(userId: string): UserBehavior {
    if (typeof window === 'undefined') {
      return this.getDefaultBehavior(userId);
    }

    const stored = localStorage.getItem(`user_behavior_${userId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          lastLogin: new Date(parsed.lastLogin),
          actions: parsed.actions.map((a: any) => ({
            ...a,
            timestamp: new Date(a.timestamp)
          }))
        };
      } catch (e) {
        console.error('Error parsing user behavior:', e);
      }
    }

    return this.getDefaultBehavior(userId);
  }

  private getDefaultBehavior(userId: string): UserBehavior {
    return {
      userId,
      role: 'property_owner',
      lastLogin: new Date(),
      pageViews: {},
      actions: [],
      preferences: {}
    };
  }

  private saveUserBehavior(userId: string, behavior: UserBehavior): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          `user_behavior_${userId}`,
          JSON.stringify(behavior)
        );
      } catch (e) {
        console.error('Error saving user behavior:', e);
      }
    }
  }
}

export const aiPredictionEngine = new AIPredictionEngine();
