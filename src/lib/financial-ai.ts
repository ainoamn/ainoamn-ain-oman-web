// src/lib/financial-ai.ts - نظام الذكاء الاصطناعي للتنبؤات المالية
import { Invoice, Payment, Check } from '@/types/financial';

// ========================
// 1. التنبؤ بالإيرادات الشهرية
// ========================

export interface RevenueProjection {
  month: string;
  projectedRevenue: number;
  confidence: number;              // نسبة الثقة (0-100)
  basedOn: string;                 // أساس التوقع
}

export function projectMonthlyRevenue(
  invoices: Invoice[],
  months: number = 3
): RevenueProjection[] {
  // حساب متوسط الإيرادات في آخر 6 أشهر
  const last6Months = invoices.filter(inv => {
    const invDate = new Date(inv.issueDate);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return invDate >= sixMonthsAgo && inv.status === 'paid';
  });

  // حساب متوسط شهري
  const totalRevenue = last6Months.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const avgMonthly = totalRevenue / 6;

  // حساب الاتجاه (نمو أو انخفاض)
  const trend = calculateTrend(last6Months);

  // إنشاء التوقعات
  const projections: RevenueProjection[] = [];
  for (let i = 1; i <= months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    
    projections.push({
      month: date.toLocaleDateString('ar-OM', { year: 'numeric', month: 'long' }),
      projectedRevenue: avgMonthly * (1 + (trend * i / 100)),
      confidence: 85 - (i * 5), // تقل الثقة مع المدى الزمني
      basedOn: `متوسط آخر 6 أشهر (${last6Months.length} فاتورة)`
    });
  }

  return projections;
}

// ========================
// 2. تحليل سلوك العملاء
// ========================

export interface CustomerBehavior {
  customerId: string;
  customerName: string;
  paymentScore: number;            // نقاط الالتزام (0-100)
  averageDelayDays: number;        // متوسط التأخير بالأيام
  totalInvoices: number;
  paidOnTime: number;
  paidLate: number;
  unpaid: number;
  riskLevel: 'low' | 'medium' | 'high'; // مستوى المخاطرة
  recommendation: string;          // توصية
  predictedNextPayment: string;    // التوقع للدفع القادم
}

export function analyzeCustomerBehavior(
  customerId: string,
  invoices: Invoice[],
  payments: Payment[]
): CustomerBehavior {
  // فلترة فواتير هذا العميل
  const customerInvoices = invoices.filter(inv => inv.customerId === customerId);
  
  if (customerInvoices.length === 0) {
    return {
      customerId,
      customerName: '',
      paymentScore: 0,
      averageDelayDays: 0,
      totalInvoices: 0,
      paidOnTime: 0,
      paidLate: 0,
      unpaid: 0,
      riskLevel: 'low',
      recommendation: 'لا توجد بيانات كافية',
      predictedNextPayment: 'غير محدد'
    };
  }

  // حساب الإحصائيات
  const paid = customerInvoices.filter(inv => inv.status === 'paid');
  const paidOnTime = paid.filter(inv => {
    if (!inv.paidDate) return false;
    return new Date(inv.paidDate) <= new Date(inv.dueDate);
  });
  const paidLate = paid.filter(inv => {
    if (!inv.paidDate) return false;
    return new Date(inv.paidDate) > new Date(inv.dueDate);
  });
  const unpaid = customerInvoices.filter(inv => 
    ['sent', 'viewed', 'overdue'].includes(inv.status)
  );

  // حساب متوسط التأخير
  const delays = paidLate.map(inv => {
    const due = new Date(inv.dueDate);
    const paid = new Date(inv.paidDate!);
    return Math.ceil((paid.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  });
  const avgDelay = delays.length > 0 ? delays.reduce((a, b) => a + b, 0) / delays.length : 0;

  // حساب نقاط الالتزام
  const onTimeRate = paidOnTime.length / customerInvoices.length;
  const paymentScore = Math.round(onTimeRate * 100);

  // تحديد مستوى المخاطرة
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (paymentScore < 50 || avgDelay > 30) {
    riskLevel = 'high';
  } else if (paymentScore < 75 || avgDelay > 15) {
    riskLevel = 'medium';
  }

  // توصية
  let recommendation = '';
  if (riskLevel === 'high') {
    recommendation = '⚠️ عميل عالي المخاطر - يُنصح بطلب دفعات مقدمة أو تأمينات إضافية';
  } else if (riskLevel === 'medium') {
    recommendation = '⚡ عميل متوسط المخاطر - متابعة دورية ضرورية';
  } else {
    recommendation = '✅ عميل منتظم - يمكن منحه تسهيلات إضافية';
  }

  // توقع الدفع القادم
  const avgPaymentDays = paid.length > 0 ? 
    paid.reduce((sum, inv) => {
      const issue = new Date(inv.issueDate);
      const payment = new Date(inv.paidDate!);
      return sum + Math.ceil((payment.getTime() - issue.getTime()) / (1000 * 60 * 60 * 24));
    }, 0) / paid.length : 0;

  const nextInvoice = unpaid[0];
  let predictedNextPayment = 'غير محدد';
  if (nextInvoice) {
    const issueDate = new Date(nextInvoice.issueDate);
    const predictedDate = new Date(issueDate.getTime() + (avgPaymentDays * 24 * 60 * 60 * 1000));
    predictedNextPayment = predictedDate.toLocaleDateString('ar-OM');
  }

  return {
    customerId,
    customerName: customerInvoices[0]?.customerName || '',
    paymentScore,
    averageDelayDays: Math.round(avgDelay),
    totalInvoices: customerInvoices.length,
    paidOnTime: paidOnTime.length,
    paidLate: paidLate.length,
    unpaid: unpaid.length,
    riskLevel,
    recommendation,
    predictedNextPayment
  };
}

// ========================
// 3. تنبيهات ذكية
// ========================

export interface SmartAlert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  actionRequired: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  relatedEntity: {
    type: 'customer' | 'invoice' | 'check' | 'payment';
    id: string;
    name: string;
  };
  dueDate?: string;
  amount?: number;
}

export function generateSmartAlerts(
  invoices: Invoice[],
  payments: Payment[],
  checks: Check[]
): SmartAlert[] {
  const alerts: SmartAlert[] = [];
  const today = new Date();

  // 1. فواتير متأخرة
  const overdueInvoices = invoices.filter(inv => {
    if (inv.status !== 'overdue') return false;
    const dueDate = new Date(inv.dueDate);
    return dueDate < today;
  });

  overdueInvoices.forEach(inv => {
    const daysOverdue = Math.ceil((today.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
    
    alerts.push({
      id: `alert_overdue_${inv.id}`,
      type: 'danger',
      title: 'فاتورة متأخرة',
      message: `العميل ${inv.customerName} لديه فاتورة متأخرة ${daysOverdue} يوم`,
      actionRequired: 'إرسال تذكير فوري أو اتخاذ إجراء قانوني',
      priority: daysOverdue > 30 ? 'urgent' : daysOverdue > 15 ? 'high' : 'medium',
      relatedEntity: {
        type: 'invoice',
        id: inv.id,
        name: inv.invoiceNumber
      },
      dueDate: inv.dueDate,
      amount: inv.remainingAmount
    });
  });

  // 2. فواتير قريبة من الاستحقاق (3-7 أيام)
  const upcomingInvoices = invoices.filter(inv => {
    if (!['sent', 'viewed'].includes(inv.status)) return false;
    const dueDate = new Date(inv.dueDate);
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue > 0 && daysUntilDue <= 7;
  });

  upcomingInvoices.forEach(inv => {
    const daysUntilDue = Math.ceil((new Date(inv.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    alerts.push({
      id: `alert_upcoming_${inv.id}`,
      type: 'warning',
      title: 'فاتورة قريبة من الاستحقاق',
      message: `تستحق خلال ${daysUntilDue} أيام - ${inv.customerName}`,
      actionRequired: 'إرسال تذكير للعميل',
      priority: daysUntilDue <= 3 ? 'high' : 'medium',
      relatedEntity: {
        type: 'invoice',
        id: inv.id,
        name: inv.invoiceNumber
      },
      dueDate: inv.dueDate,
      amount: inv.totalAmount
    });
  });

  // 3. شيكات مرتدة
  const bouncedChecks = checks.filter(chk => chk.status === 'bounced');
  
  bouncedChecks.forEach(chk => {
    alerts.push({
      id: `alert_bounced_${chk.id}`,
      type: 'danger',
      title: 'شيك مرتد',
      message: `شيك من ${chk.issuerName} - ${chk.bouncedReason || 'غير معروف'}`,
      actionRequired: 'التواصل الفوري مع العميل واستبدال الشيك',
      priority: 'urgent',
      relatedEntity: {
        type: 'check',
        id: chk.id,
        name: chk.checkNumber
      },
      amount: chk.amount
    });
  });

  // 4. شيكات قريبة من الاستحقاق (3 أيام)
  const upcomingChecks = checks.filter(chk => {
    if (chk.status !== 'pending' && chk.status !== 'deposited') return false;
    const dueDate = new Date(chk.dueDate);
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue > 0 && daysUntilDue <= 3;
  });

  upcomingChecks.forEach(chk => {
    const daysUntilDue = Math.ceil((new Date(chk.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    alerts.push({
      id: `alert_check_due_${chk.id}`,
      type: 'info',
      title: 'شيك قريب من الاستحقاق',
      message: `شيك ${chk.checkNumber} يستحق خلال ${daysUntilDue} أيام`,
      actionRequired: chk.type === 'received' ? 'إيداع الشيك في البنك' : 'التأكد من توفر الرصيد',
      priority: 'medium',
      relatedEntity: {
        type: 'check',
        id: chk.id,
        name: chk.checkNumber
      },
      dueDate: chk.dueDate,
      amount: chk.amount
    });
  });

  // 5. عملاء غير ملتزمين (تحليل الأنماط)
  const customerGroups = groupInvoicesByCustomer(invoices);
  
  Object.entries(customerGroups).forEach(([customerId, customerInvs]) => {
    const behavior = analyzeCustomerBehavior(customerId, customerInvs as Invoice[], payments);
    
    if (behavior.riskLevel === 'high') {
      const unpaidAmount = (customerInvs as Invoice[])
        .filter(inv => inv.status === 'overdue')
        .reduce((sum, inv) => sum + inv.remainingAmount, 0);

      if (unpaidAmount > 0) {
        alerts.push({
          id: `alert_risky_customer_${customerId}`,
          type: 'danger',
          title: 'عميل غير ملتزم',
          message: `${behavior.customerName} - نقاط الالتزام: ${behavior.paymentScore}/100`,
          actionRequired: `متوقع عجز ${unpaidAmount.toLocaleString()} ر.ع - اتخاذ إجراءات فورية`,
          priority: 'urgent',
          relatedEntity: {
            type: 'customer',
            id: customerId,
            name: behavior.customerName
          },
          amount: unpaidAmount
        });
      }
    }
  });

  // 6. تنبيه بالشيكات المتكررة الارتداد
  const checksByIssuer = groupChecksByIssuer(checks);
  
  Object.entries(checksByIssuer).forEach(([issuerId, issuerChecks]) => {
    const bounced = (issuerChecks as Check[]).filter(chk => chk.status === 'bounced');
    
    if (bounced.length >= 2) {
      const issuerName = (issuerChecks as Check[])[0]?.issuerName || 'غير معروف';
      const nextCheck = (issuerChecks as Check[]).find(chk => 
        chk.status === 'pending' || chk.status === 'deposited'
      );

      if (nextCheck) {
        const daysUntilDue = Math.ceil((new Date(nextCheck.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue <= 7 && daysUntilDue > 0) {
          alerts.push({
            id: `alert_recurring_bounced_${issuerId}`,
            type: 'warning',
            title: 'شيكات متكررة الارتداد',
            message: `${issuerName} لديه ${bounced.length} شيكات مرتدة سابقاً`,
            actionRequired: `التواصل مع العميل قبل ${daysUntilDue} أيام وطلب طريقة دفع بديلة`,
            priority: 'high',
            relatedEntity: {
              type: 'check',
              id: nextCheck.id,
              name: nextCheck.checkNumber
            },
            dueDate: nextCheck.dueDate,
            amount: nextCheck.amount
          });
        }
      }
    }
  });

  // ترتيب حسب الأولوية
  return alerts.sort((a, b) => {
    const priorities = { urgent: 4, high: 3, medium: 2, low: 1 };
    return priorities[b.priority] - priorities[a.priority];
  });
}

// ========================
// 4. التنبؤ بالتدفق النقدي
// ========================

export interface CashFlowProjection {
  date: string;
  expectedInflow: number;          // التدفقات الداخلة المتوقعة
  expectedOutflow: number;         // التدفقات الخارجة المتوقعة
  netCashFlow: number;             // صافي التدفق
  cumulativeBalance: number;       // الرصيد التراكمي
  confidence: number;
}

export function projectCashFlow(
  invoices: Invoice[],
  payments: Payment[],
  checks: Check[],
  currentBalance: number,
  days: number = 30
): CashFlowProjection[] {
  const projections: CashFlowProjection[] = [];
  let cumulativeBalance = currentBalance;

  for (let i = 1; i <= days; i++) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + i);
    const dateStr = targetDate.toISOString().split('T')[0];

    // التدفقات الداخلة المتوقعة
    const expectedInflow = invoices
      .filter(inv => inv.dueDate === dateStr && ['sent', 'viewed'].includes(inv.status))
      .reduce((sum, inv) => sum + inv.remainingAmount, 0);

    // إضافة الشيكات المستحقة
    const checksIn = checks
      .filter(chk => chk.type === 'received' && chk.dueDate === dateStr && chk.status === 'pending')
      .reduce((sum, chk) => sum + chk.amount, 0);

    // التدفقات الخارجة المتوقعة
    const checksOut = checks
      .filter(chk => chk.type === 'issued' && chk.dueDate === dateStr && chk.status === 'pending')
      .reduce((sum, chk) => sum + chk.amount, 0);

    const totalInflow = expectedInflow + checksIn;
    const totalOutflow = checksOut;
    const netFlow = totalInflow - totalOutflow;
    cumulativeBalance += netFlow;

    projections.push({
      date: targetDate.toLocaleDateString('ar-OM', { day: 'numeric', month: 'short' }),
      expectedInflow: totalInflow,
      expectedOutflow: totalOutflow,
      netCashFlow: netFlow,
      cumulativeBalance,
      confidence: 90 - (i / days * 20) // تقل الثقة مع الوقت
    });
  }

  return projections;
}

// ========================
// دوال مساعدة
// ========================

function calculateTrend(invoices: Invoice[]): number {
  if (invoices.length < 2) return 0;

  // حساب الاتجاه البسيط
  const sorted = [...invoices].sort((a, b) => 
    new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
  );

  const first = sorted.slice(0, Math.ceil(sorted.length / 2));
  const second = sorted.slice(Math.ceil(sorted.length / 2));

  const firstAvg = first.reduce((sum, inv) => sum + inv.totalAmount, 0) / first.length;
  const secondAvg = second.reduce((sum, inv) => sum + inv.totalAmount, 0) / second.length;

  return ((secondAvg - firstAvg) / firstAvg) * 100;
}

function groupInvoicesByCustomer(invoices: Invoice[]): Record<string, Invoice[]> {
  return invoices.reduce((groups, inv) => {
    if (!groups[inv.customerId]) {
      groups[inv.customerId] = [];
    }
    groups[inv.customerId].push(inv);
    return groups;
  }, {} as Record<string, Invoice[]>);
}

function groupChecksByIssuer(checks: Check[]): Record<string, Check[]> {
  return checks.reduce((groups, chk) => {
    if (!groups[chk.issuerId]) {
      groups[chk.issuerId] = [];
    }
    groups[chk.issuerId].push(chk);
    return groups;
  }, {} as Record<string, Check[]>);
}

// دالة مساعدة مستوردة من تحليل السلوك
function analyzeCustomerBehavior(customerId: string, invoices: Invoice[], payments: Payment[]) {
  // نفس المنطق من الأعلى
  return {
    customerId,
    customerName: invoices[0]?.customerName || '',
    paymentScore: 0,
    averageDelayDays: 0,
    totalInvoices: invoices.length,
    paidOnTime: 0,
    paidLate: 0,
    unpaid: 0,
    riskLevel: 'low' as const,
    recommendation: '',
    predictedNextPayment: ''
  };
}

// ========================
// 5. حساب المبالغ المتوقعة شهرياً
// ========================

export interface MonthlyExpectedAmounts {
  month: string;
  expectedIncome: number;
  expectedExpenses: number;
  netExpected: number;
  details: {
    rentIncome: number;
    serviceIncome: number;
    subscriptionIncome: number;
    maintenanceExpenses: number;
    utilityExpenses: number;
    otherExpenses: number;
  };
}

export function calculateMonthlyExpectedAmounts(
  invoices: Invoice[]
): MonthlyExpectedAmounts[] {
  const nextMonths = 3;
  const projections: MonthlyExpectedAmounts[] = [];

  for (let i = 0; i < nextMonths; i++) {
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + i);
    const month = targetDate.toLocaleDateString('ar-OM', { year: 'numeric', month: 'long' });
    const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

    // الفواتير المستحقة في هذا الشهر
    const monthInvoices = invoices.filter(inv => {
      const dueDate = new Date(inv.dueDate);
      return dueDate >= monthStart && dueDate <= monthEnd;
    });

    const rentIncome = monthInvoices
      .filter(inv => inv.type === 'rent')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const serviceIncome = monthInvoices
      .filter(inv => inv.type === 'service')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const subscriptionIncome = monthInvoices
      .filter(inv => inv.type === 'subscription')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    // المصروفات (تقديرية من البيانات التاريخية)
    const expectedExpenses = (rentIncome + serviceIncome) * 0.35; // 35% من الدخل

    projections.push({
      month,
      expectedIncome: rentIncome + serviceIncome + subscriptionIncome,
      expectedExpenses,
      netExpected: (rentIncome + serviceIncome + subscriptionIncome) - expectedExpenses,
      details: {
        rentIncome,
        serviceIncome,
        subscriptionIncome,
        maintenanceExpenses: expectedExpenses * 0.4,
        utilityExpenses: expectedExpenses * 0.3,
        otherExpenses: expectedExpenses * 0.3
      }
    });
  }

  return projections;
}

