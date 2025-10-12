import { PropertyStats } from '@/server/properties/stats';

export interface AIInsight {
  id: string;
  type: 'warning' | 'suggestion' | 'prediction' | 'optimization';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  estimatedImpact: string;
  category: string;
  confidence: number;
  createdAt: string;
}

export async function getAIInsights(propertyId: string): Promise<AIInsight[]> {
  try {
    // في التطبيق الحقيقي، سيتم استدعاء نموذج الذكاء الاصطناعي
    // هنا سنقوم بإنشاء نصائح ذكية بناءً على البيانات المتاحة
    
    const insights: AIInsight[] = [];
    const now = new Date();

    // جلب إحصائيات العقار
    const { getPropertyStats } = await import('@/server/properties/stats');
    const stats = await getPropertyStats(propertyId);

    // تحليل المهام المتأخرة
    if (stats.overdueTasks > 0) {
      insights.push({
        id: `overdue-tasks-${propertyId}`,
        type: 'warning',
        title: 'مهام متأخرة تحتاج متابعة',
        description: `لديك ${stats.overdueTasks} مهمة متأخرة تحتاج إلى متابعة فورية. تأخير المهام قد يؤثر على رضا العملاء وإدارة العقار.`,
        priority: 'high',
        actionRequired: true,
        estimatedImpact: 'تحسين كفاءة الإدارة بنسبة 15-20%',
        category: 'tasks',
        confidence: 0.95,
        createdAt: now.toISOString()
      });
    }

    // تحليل معدل الإشغال
    if (stats.occupancyRate < 70) {
      insights.push({
        id: `low-occupancy-${propertyId}`,
        type: 'suggestion',
        title: 'معدل إشغال منخفض',
        description: `معدل الإشغال الحالي ${stats.occupancyRate}% أقل من المتوسط المطلوب. يُنصح بمراجعة استراتيجية التسويق والأسعار.`,
        priority: 'medium',
        actionRequired: true,
        estimatedImpact: 'زيادة الإيرادات بنسبة 25-30%',
        category: 'revenue',
        confidence: 0.85,
        createdAt: now.toISOString()
      });
    }

    // تحليل الفواتير المتأخرة
    if (stats.overdueInvoices > 0) {
      insights.push({
        id: `overdue-invoices-${propertyId}`,
        type: 'warning',
        title: 'فواتير متأخرة السداد',
        description: `لديك ${stats.overdueInvoices} فاتورة متأخرة السداد بقيمة إجمالية تقدر بـ ${stats.overdueInvoices * 500} ريال. يُنصح بمتابعة تحصيل المستحقات.`,
        priority: 'high',
        actionRequired: true,
        estimatedImpact: 'تحسين التدفق النقدي بنسبة 20%',
        category: 'financial',
        confidence: 0.90,
        createdAt: now.toISOString()
      });
    }

    // تحليل تكاليف الصيانة
    if (stats.maintenanceCosts > stats.monthlyRevenue * 0.3) {
      insights.push({
        id: `high-maintenance-${propertyId}`,
        type: 'suggestion',
        title: 'تكاليف صيانة عالية',
        description: `تكاليف الصيانة تشكل ${Math.round((stats.maintenanceCosts / stats.monthlyRevenue) * 100)}% من الإيرادات الشهرية. يُنصح بمراجعة خطة الصيانة الوقائية.`,
        priority: 'medium',
        actionRequired: false,
        estimatedImpact: 'توفير 15-20% من تكاليف الصيانة',
        category: 'maintenance',
        confidence: 0.80,
        createdAt: now.toISOString()
      });
    }

    // تحليل العقود المنتهية الصلاحية
    if (stats.expiredContracts > 0) {
      insights.push({
        id: `expired-contracts-${propertyId}`,
        type: 'warning',
        title: 'عقود منتهية الصلاحية',
        description: `لديك ${stats.expiredContracts} عقد منتهي الصلاحية يحتاج إلى تجديد أو إنهاء. تأخير التجديد قد يؤدي إلى خسارة الإيرادات.`,
        priority: 'high',
        actionRequired: true,
        estimatedImpact: 'الحفاظ على الإيرادات الحالية',
        category: 'contracts',
        confidence: 0.95,
        createdAt: now.toISOString()
      });
    }

    // تحليل الأداء المالي
    if (stats.monthlyRevenue > 0) {
      const revenueGrowth = ((stats.monthlyRevenue - (stats.totalRevenue / 12)) / (stats.totalRevenue / 12)) * 100;
      
      if (revenueGrowth > 20) {
        insights.push({
          id: `revenue-growth-${propertyId}`,
          type: 'optimization',
          title: 'نمو ممتاز في الإيرادات',
          description: `الإيرادات الشهرية نمت بنسبة ${revenueGrowth.toFixed(1)}% مقارنة بالمتوسط. استمر في الاستراتيجية الحالية.`,
          priority: 'low',
          actionRequired: false,
          estimatedImpact: 'الحفاظ على معدل النمو الحالي',
          category: 'revenue',
          confidence: 0.75,
          createdAt: now.toISOString()
        });
      } else if (revenueGrowth < -10) {
        insights.push({
          id: `revenue-decline-${propertyId}`,
          type: 'warning',
          title: 'انخفاض في الإيرادات',
          description: `الإيرادات الشهرية انخفضت بنسبة ${Math.abs(revenueGrowth).toFixed(1)}% مقارنة بالمتوسط. يُنصح بمراجعة الاستراتيجية.`,
          priority: 'high',
          actionRequired: true,
          estimatedImpact: 'استعادة معدل الإيرادات المطلوب',
          category: 'revenue',
          confidence: 0.85,
          createdAt: now.toISOString()
        });
      }
    }

    // نصائح تحسينية عامة
    if (stats.totalTasks > 0 && stats.completedTasks / stats.totalTasks < 0.7) {
      insights.push({
        id: `task-efficiency-${propertyId}`,
        type: 'suggestion',
        title: 'تحسين كفاءة المهام',
        description: `معدل إنجاز المهام ${Math.round((stats.completedTasks / stats.totalTasks) * 100)}% أقل من المستوى المطلوب. يُنصح بتحسين عملية إدارة المهام.`,
        priority: 'medium',
        actionRequired: false,
        estimatedImpact: 'تحسين الإنتاجية بنسبة 25%',
        category: 'efficiency',
        confidence: 0.80,
        createdAt: now.toISOString()
      });
    }

    // تحليل القضايا القانونية
    if (stats.legalIssues > 0) {
      insights.push({
        id: `legal-issues-${propertyId}`,
        type: 'warning',
        title: 'قضايا قانونية مفتوحة',
        description: `لديك ${stats.legalIssues} قضية قانونية مفتوحة. يُنصح بمتابعة هذه القضايا مع المحامي المختص.`,
        priority: 'high',
        actionRequired: true,
        estimatedImpact: 'تجنب المخاطر القانونية',
        category: 'legal',
        confidence: 0.90,
        createdAt: now.toISOString()
      });
    }

    // ترتيب النصائح حسب الأولوية
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    insights.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    return insights.slice(0, 10); // إرجاع أول 10 نصائح
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return [];
  }
}

// دالة لإنشاء نصائح مخصصة بناءً على نوع العقار
export async function getCustomInsights(propertyId: string, propertyType: string): Promise<AIInsight[]> {
  const baseInsights = await getAIInsights(propertyId);
  const customInsights: AIInsight[] = [];

  // نصائح خاصة بالعقارات السكنية
  if (propertyType === 'residential') {
    customInsights.push({
      id: `residential-maintenance-${propertyId}`,
      type: 'suggestion',
      title: 'صيانة دورية للوحدات السكنية',
      description: 'يُنصح بإجراء صيانة دورية للوحدات السكنية كل 6 أشهر لضمان رضا المستأجرين والحفاظ على قيمة العقار.',
      priority: 'medium',
      actionRequired: false,
      estimatedImpact: 'تحسين رضا المستأجرين بنسبة 30%',
      category: 'maintenance',
      confidence: 0.85,
      createdAt: new Date().toISOString()
    });
  }

  // نصائح خاصة بالعقارات التجارية
  if (propertyType === 'commercial') {
    customInsights.push({
      id: `commercial-optimization-${propertyId}`,
      type: 'optimization',
      title: 'تحسين استغلال المساحات التجارية',
      description: 'يُنصح بمراجعة تخطيط المساحات التجارية لزيادة كفاءة الاستغلال وتحسين الإيرادات.',
      priority: 'medium',
      actionRequired: false,
      estimatedImpact: 'زيادة الإيرادات بنسبة 15-20%',
      category: 'optimization',
      confidence: 0.75,
      createdAt: new Date().toISOString()
    });
  }

  return [...baseInsights, ...customInsights];
}
