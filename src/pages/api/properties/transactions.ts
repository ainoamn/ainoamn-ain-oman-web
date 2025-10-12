// src/pages/api/properties/transactions.ts - API المعاملات المالية
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  propertyId: string;
  propertyName: string;
  status: 'completed' | 'pending' | 'overdue';
  reference?: string;
  createdAt: string;
  updatedAt: string;
}

interface Property {
  id: string;
  title: string;
  priceMonthly?: number;
  priceOMR?: number;
  status?: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');

// قراءة العقارات
const readProperties = (): Property[] => {
  try {
    if (fs.existsSync(PROPERTIES_FILE)) {
      const data = fs.readFileSync(PROPERTIES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading properties:', error);
  }
  return [];
};

// قراءة المعاملات
const readTransactions = (): Transaction[] => {
  try {
    if (fs.existsSync(TRANSACTIONS_FILE)) {
      const data = fs.readFileSync(TRANSACTIONS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading transactions:', error);
  }
  return [];
};

// كتابة المعاملات
const writeTransactions = (transactions: Transaction[]): void => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2));
  } catch (error) {
    console.error('Error writing transactions:', error);
    throw error;
  }
};

// إنشاء معاملة جديدة
const createTransaction = (transactionData: Partial<Transaction>): Transaction => {
  const now = new Date().toISOString();
  const id = `TXN-${Date.now()}`;
  
  return {
    id,
    type: transactionData.type || 'income',
    category: transactionData.category || '',
    description: transactionData.description || '',
    amount: transactionData.amount || 0,
    date: transactionData.date || now,
    propertyId: transactionData.propertyId || '',
    propertyName: transactionData.propertyName || '',
    status: transactionData.status || 'pending',
    reference: transactionData.reference,
    createdAt: now,
    updatedAt: now
  };
};

// تصفية المعاملات حسب الفترة والعقار
const filterTransactions = (
  transactions: Transaction[],
  period: string = 'all',
  property: string = 'all'
): Transaction[] => {
  let filtered = [...transactions];

  // تصفية حسب الفترة
  if (period !== 'all') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return filtered;
    }

    filtered = filtered.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate;
    });
  }

  // تصفية حسب العقار
  if (property !== 'all') {
    filtered = filtered.filter(t => t.propertyId === property);
  }

  // ترتيب حسب التاريخ (الأحدث أولاً)
  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { period = 'all', property = 'all' } = req.query;

  try {
    switch (method) {
      case 'GET':
        // قراءة المعاملات
        const transactions = readTransactions();
        const properties = readProperties();

        // ربط أسماء العقارات
        const transactionsWithPropertyNames = transactions.map(transaction => {
          const foundProperty = properties.find(p => p.id === transaction.propertyId);
          return {
            ...transaction,
            propertyName: foundProperty?.title || transaction.propertyName || 'عقار غير محدد'
          };
        });

        // تصفية المعاملات
        const filteredTransactions = filterTransactions(
          transactionsWithPropertyNames,
          period as string,
          property as string
        );

        res.status(200).json({
          transactions: filteredTransactions,
          total: filteredTransactions.length,
          period,
          property
        });
        break;

      case 'POST':
        // إنشاء معاملة جديدة
        const { type, category, description, amount, date, propertyId, status, reference } = req.body;

        if (!type || !category || !description || !amount || !propertyId) {
          return res.status(400).json({
            error: 'Missing required fields: type, category, description, amount, propertyId'
          });
        }

        const allProperties = readProperties();
        const foundProperty = allProperties.find(p => p.id === propertyId);
        const propertyName = foundProperty?.title || 'عقار غير محدد';

        const newTransaction = createTransaction({
          type,
          category,
          description,
          amount: Number(amount),
          date: date || new Date().toISOString(),
          propertyId,
          propertyName,
          status,
          reference
        });

        const existingTransactions = readTransactions();
        const updatedTransactions = [...existingTransactions, newTransaction];
        writeTransactions(updatedTransactions);

        res.status(201).json({
          message: 'Transaction created successfully',
          transaction: newTransaction
        });
        break;

      case 'PUT':
        // تحديث معاملة
        const { id, ...updateData } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'Transaction ID is required' });
        }

        const allTransactions = readTransactions();
        const transactionIndex = allTransactions.findIndex(t => t.id === id);

        if (transactionIndex === -1) {
          return res.status(404).json({ error: 'Transaction not found' });
        }

        const updatedTransaction = {
          ...allTransactions[transactionIndex],
          ...updateData,
          updatedAt: new Date().toISOString()
        };

        allTransactions[transactionIndex] = updatedTransaction;
        writeTransactions(allTransactions);

        res.status(200).json({
          message: 'Transaction updated successfully',
          transaction: updatedTransaction
        });
        break;

      case 'DELETE':
        // حذف معاملة
        const { id: deleteId } = req.query;

        if (!deleteId) {
          return res.status(400).json({ error: 'Transaction ID is required' });
        }

        const transactionsToDelete = readTransactions();
        const deleteIndex = transactionsToDelete.findIndex(t => t.id === deleteId);

        if (deleteIndex === -1) {
          return res.status(404).json({ error: 'Transaction not found' });
        }

        transactionsToDelete.splice(deleteIndex, 1);
        writeTransactions(transactionsToDelete);

        res.status(200).json({
          message: 'Transaction deleted successfully'
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Error in transactions API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
