// src/pages/api/financial/summary.ts - API لحساب الملخص المالي من قاعدة البيانات
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');

// قراءة ملف JSON
const readJsonFile = (filename: string): any => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      
      // إذا كان الملف يحتوي على مصفوفة مباشرة
      if (Array.isArray(parsed)) {
        return parsed;
      }
      
      // إذا كان object يحتوي على خاصية بنفس الاسم (بدون .json)
      const key = filename.replace('.json', '');
      if (parsed[key] && Array.isArray(parsed[key])) {
        return parsed[key];
      }
      
      // إذا كان object يحتوي على أي مصفوفة
      const firstArray = Object.values(parsed).find(v => Array.isArray(v));
      if (firstArray) {
        return firstArray as any[];
      }
      
      return [];
    }
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
  }
  return [];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // قراءة جميع البيانات المالية
    const invoices = readJsonFile('invoices.json');
    const payments = readJsonFile('payments.json');
    const bookings = readJsonFile('bookings.json');
    const contracts = readJsonFile('contracts.json');
    const checks = readJsonFile('checks.json');
    const maintenance = readJsonFile('maintenance.json');

    // حساب الإيرادات
    const totalInvoices = invoices.reduce((sum: number, inv: any) => {
      const amount = parseFloat(inv.amount || inv.totalAmount || 0);
      return sum + amount;
    }, 0);

    const totalPayments = payments.reduce((sum: number, pay: any) => {
      const amount = parseFloat(pay.amount || 0);
      return sum + amount;
    }, 0);

    const rentRevenue = bookings.reduce((sum: number, booking: any) => {
      const amount = parseFloat(booking.totalAmount || booking.totalRent || 0);
      return sum + amount;
    }, 0);

    const totalRevenue = totalInvoices + totalPayments + rentRevenue;

    // حساب المصروفات
    const maintenanceCosts = maintenance.reduce((sum: number, req: any) => {
      const cost = parseFloat(req.estimatedCost || req.actualCost || 0);
      return sum + cost;
    }, 0);

    const totalExpenses = maintenanceCosts;

    // حساب الأرباح
    const grossProfit = totalRevenue - totalExpenses;
    const netProfit = grossProfit; // مبسط - يمكن إضافة خصومات أخرى
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // حساب المستحقات
    const pendingInvoices = invoices.filter((inv: any) => 
      inv.status === 'pending' || inv.status === 'unpaid'
    );
    const overdueInvoices = invoices.filter((inv: any) => 
      inv.status === 'overdue'
    );

    const totalReceivables = pendingInvoices.reduce((sum: number, inv: any) => 
      sum + parseFloat(inv.amount || inv.totalAmount || 0), 0
    );
    const overdueReceivables = overdueInvoices.reduce((sum: number, inv: any) => 
      sum + parseFloat(inv.amount || inv.totalAmount || 0), 0
    );

    // حساب الشيكات المعلقة
    const pendingChecks = checks.filter((check: any) => 
      check.status === 'pending'
    );
    const totalPayables = pendingChecks.reduce((sum: number, check: any) => 
      sum + parseFloat(check.amount || 0), 0
    );

    // إنشاء الملخص
    const summary = {
      revenue: {
        total: totalRevenue,
        monthly: totalRevenue / 12, // متوسط شهري
        growth: 0, // يحتاج مقارنة بالشهر السابق
        bySource: {
          rent: rentRevenue,
          service: 0,
          subscription: 0,
          auction: 0,
          other: totalInvoices
        }
      },
      expenses: {
        total: totalExpenses,
        monthly: totalExpenses / 12,
        growth: 0,
        byCategory: {
          maintenance: maintenanceCosts,
          utilities: 0,
          salaries: 0,
          marketing: 0,
          administrative: 0,
          other: 0
        }
      },
      profit: {
        gross: grossProfit,
        net: netProfit,
        margin: profitMargin
      },
      cashFlow: {
        operating: totalPayments,
        investing: 0,
        financing: 0,
        net: totalPayments
      },
      receivables: {
        total: totalReceivables,
        current: totalReceivables - overdueReceivables,
        overdue: overdueReceivables,
        doubtful: 0
      },
      payables: {
        total: totalPayables,
        current: totalPayables,
        overdue: 0
      }
    };

    res.status(200).json(summary);
  } catch (error) {
    console.error('Error calculating financial summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

