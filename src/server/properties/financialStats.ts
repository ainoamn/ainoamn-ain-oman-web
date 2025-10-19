import { getAllInvoices } from '@/server/properties/stats';

export interface FinancialStats {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  averageInvoiceValue: number;
  collectionRate: number;
  monthlyGrowth: number;
  quarterlyRevenue: number;
  yearlyRevenue: number;
  topRevenueSources: Array<{
    source: string;
    amount: number;
    percentage: number;
  }>;
  paymentTrends: Array<{
    month: string;
    paid: number;
    pending: number;
    overdue: number;
  }>;
}

export async function getFinancialStats(propertyId: string): Promise<FinancialStats> {
  try {
    const invoices = await getAllInvoices();
    const propertyInvoices = invoices.filter(invoice => invoice.propertyId === propertyId);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // حساب الإيرادات الأساسية
    const totalRevenue = propertyInvoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

    const monthlyRevenue = propertyInvoices
      .filter(invoice => {
        if (invoice.status !== 'paid' || !invoice.issuedAt) return false;
        const invoiceDate = new Date(invoice.issuedAt);
        return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear;
      })
      .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

    const lastMonthRevenue = propertyInvoices
      .filter(invoice => {
        if (invoice.status !== 'paid' || !invoice.issuedAt) return false;
        const invoiceDate = new Date(invoice.issuedAt);
        return invoiceDate.getMonth() === lastMonth && invoiceDate.getFullYear() === lastMonthYear;
      })
      .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

    const monthlyGrowth = lastMonthRevenue > 0 
      ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    // حساب المبالغ المعلقة والمتأخرة
    const pendingAmount = propertyInvoices
      .filter(invoice => invoice.status === 'pending')
      .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

    const overdueAmount = propertyInvoices
      .filter(invoice => 
        invoice.status === 'overdue' || 
        (invoice.dueAt && new Date(invoice.dueAt) < now && invoice.status !== 'paid')
      )
      .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

    // إحصائيات الفواتير
    const totalInvoices = propertyInvoices.length;
    const paidInvoices = propertyInvoices.filter(invoice => invoice.status === 'paid').length;
    const pendingInvoices = propertyInvoices.filter(invoice => invoice.status === 'pending').length;
    const overdueInvoices = propertyInvoices.filter(invoice => 
      invoice.status === 'overdue' || 
      (invoice.dueAt && new Date(invoice.dueAt) < now && invoice.status !== 'paid')
    ).length;

    // متوسط قيمة الفاتورة
    const averageInvoiceValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

    // معدل التحصيل
    const collectionRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;

    // الإيرادات الربعية والسنوية
    const quarterlyRevenue = propertyInvoices
      .filter(invoice => {
        if (invoice.status !== 'paid' || !invoice.issuedAt) return false;
        const invoiceDate = new Date(invoice.issuedAt);
        const quarterStart = Math.floor(currentMonth / 3) * 3;
        return invoiceDate.getMonth() >= quarterStart && 
               invoiceDate.getMonth() < quarterStart + 3 && 
               invoiceDate.getFullYear() === currentYear;
      })
      .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

    const yearlyRevenue = propertyInvoices
      .filter(invoice => {
        if (invoice.status !== 'paid' || !invoice.issuedAt) return false;
        const invoiceDate = new Date(invoice.issuedAt);
        return invoiceDate.getFullYear() === currentYear;
      })
      .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

    // مصادر الإيرادات الرئيسية
    const revenueSources: Record<string, number> = {};
    propertyInvoices
      .filter(invoice => invoice.status === 'paid')
      .forEach(invoice => {
        invoice.items?.forEach(item => {
          const source = item.title || 'غير محدد';
          revenueSources[source] = (revenueSources[source] || 0) + item.total;
        });
      });

    const topRevenueSources = Object.entries(revenueSources)
      .map(([source, amount]) => ({
        source,
        amount,
        percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // اتجاهات الدفع (آخر 12 شهر)
    const paymentTrends = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const monthName = date.toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn',  month: 'long', year: 'numeric' });
      
      const monthInvoices = propertyInvoices.filter(invoice => {
        if (!invoice.issuedAt) return false;
        const invoiceDate = new Date(invoice.issuedAt);
        return invoiceDate.getMonth() === date.getMonth() && 
               invoiceDate.getFullYear() === date.getFullYear();
      });

      const paid = monthInvoices
        .filter(invoice => invoice.status === 'paid')
        .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

      const pending = monthInvoices
        .filter(invoice => invoice.status === 'pending')
        .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

      const overdue = monthInvoices
        .filter(invoice => 
          invoice.status === 'overdue' || 
          (invoice.dueAt && new Date(invoice.dueAt) < now && invoice.status !== 'paid')
        )
        .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

      paymentTrends.push({
        month: monthName,
        paid,
        pending,
        overdue
      });
    }

    return {
      totalRevenue,
      monthlyRevenue,
      pendingAmount,
      overdueAmount,
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      averageInvoiceValue,
      collectionRate,
      monthlyGrowth,
      quarterlyRevenue,
      yearlyRevenue,
      topRevenueSources,
      paymentTrends
    };
  } catch (error) {
    console.error('Error calculating financial stats:', error);
    // إرجاع إحصائيات افتراضية في حالة الخطأ
    return {
      totalRevenue: 0,
      monthlyRevenue: 0,
      pendingAmount: 0,
      overdueAmount: 0,
      totalInvoices: 0,
      paidInvoices: 0,
      pendingInvoices: 0,
      overdueInvoices: 0,
      averageInvoiceValue: 0,
      collectionRate: 0,
      monthlyGrowth: 0,
      quarterlyRevenue: 0,
      yearlyRevenue: 0,
      topRevenueSources: [],
      paymentTrends: []
    };
  }
}
