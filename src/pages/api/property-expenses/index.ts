// src/pages/api/property-expenses/index.ts - API لإدارة مصاريف العقارات
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface PropertyExpense {
  id: string;
  propertyId: string;
  unitId?: string | null;
  ownerId: string;
  tenantId?: string | null;
  expenseType: string;
  expenseCategory: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
  receiptPath?: string;
  receiptNumber?: string;
  isReimbursable: boolean;
  reimbursedAmount: number;
  reimbursedDate?: string | null;
  vendor?: string;
  vendorContact?: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

const dataFilePath = path.join(process.cwd(), '.data', 'property-expenses.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // قراءة البيانات من الملف
    const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    let expenses: PropertyExpense[] = data.expenses || [];

    if (req.method === 'GET') {
      const { 
        propertyId, 
        unitId, 
        ownerId, 
        tenantId, 
        expenseType, 
        status, 
        dateFrom, 
        dateTo,
        reimbursable 
      } = req.query;

      // فلترة المصاريف حسب المعايير
      let filteredExpenses = expenses;

      if (propertyId) {
        filteredExpenses = filteredExpenses.filter(expense => expense.propertyId === propertyId);
      }

      if (unitId) {
        filteredExpenses = filteredExpenses.filter(expense => expense.unitId === unitId);
      }

      if (ownerId) {
        filteredExpenses = filteredExpenses.filter(expense => expense.ownerId === ownerId);
      }

      if (tenantId) {
        filteredExpenses = filteredExpenses.filter(expense => expense.tenantId === tenantId);
      }

      if (expenseType) {
        filteredExpenses = filteredExpenses.filter(expense => expense.expenseType === expenseType);
      }

      if (status) {
        filteredExpenses = filteredExpenses.filter(expense => expense.status === status);
      }

      if (dateFrom) {
        const fromDate = new Date(dateFrom as string);
        filteredExpenses = filteredExpenses.filter(expense => new Date(expense.date) >= fromDate);
      }

      if (dateTo) {
        const toDate = new Date(dateTo as string);
        filteredExpenses = filteredExpenses.filter(expense => new Date(expense.date) <= toDate);
      }

      if (reimbursable === 'true') {
        filteredExpenses = filteredExpenses.filter(expense => expense.isReimbursable);
      }

      // حساب الإحصائيات
      const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const totalReimbursed = filteredExpenses.reduce((sum, expense) => sum + expense.reimbursedAmount, 0);
      const pendingAmount = filteredExpenses
        .filter(expense => expense.isReimbursable && expense.reimbursedAmount === 0)
        .reduce((sum, expense) => sum + expense.amount, 0);

      return res.status(200).json({
        success: true,
        expenses: filteredExpenses,
        total: filteredExpenses.length,
        statistics: {
          totalAmount,
          totalReimbursed,
          pendingAmount,
          netAmount: totalAmount - totalReimbursed
        }
      });
    }

    if (req.method === 'POST') {
      const newExpense: PropertyExpense = {
        id: `EXP-${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      expenses.push(newExpense);

      // حفظ البيانات
      fs.writeFileSync(dataFilePath, JSON.stringify({ expenses }, null, 2));

      return res.status(201).json({
        success: true,
        expense: newExpense,
        message: 'تم إضافة المصروف بنجاح'
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });

  } catch (error) {
    console.error('Error in property-expenses API:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'خطأ في الخادم',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
