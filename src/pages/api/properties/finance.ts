// src/pages/api/properties/finance.ts - API المالية العقارية
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface FinancialData {
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  totalExpenses: number;
  netProfit: number;
  occupancyRate: number;
  averageRent: number;
  pendingPayments: number;
  overduePayments: number;
}

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
}

interface Property {
  id: string;
  title: string;
  priceMonthly?: number;
  priceOMR?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Booking {
  id: string;
  propertyId: string;
  propertyName: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  paymentStatus?: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');

// إنشاء بيانات تجريبية للمعاملات إذا لم تكن موجودة
const createSampleTransactions = (): Transaction[] => {
  return [
    {
      id: 'TXN-001',
      type: 'income',
      category: 'إيجار',
      description: 'إيجار شقة رقم 101',
      amount: 450,
      date: new Date().toISOString(),
      propertyId: 'P-20250911120430',
      propertyName: 'شقة في مسقط',
      status: 'completed',
      reference: 'RENT-001'
    },
    {
      id: 'TXN-002',
      type: 'expense',
      category: 'صيانة',
      description: 'صيانة مكيف الهواء',
      amount: 120,
      date: new Date(Date.now() - 86400000).toISOString(),
      propertyId: 'P-20250911120430',
      propertyName: 'شقة في مسقط',
      status: 'completed',
      reference: 'MAINT-001'
    },
    {
      id: 'TXN-003',
      type: 'income',
      category: 'إيجار',
      description: 'إيجار فيلا رقم 205',
      amount: 800,
      date: new Date(Date.now() - 172800000).toISOString(),
      propertyId: 'P-20250930145909',
      propertyName: 'فيلا في صلالة',
      status: 'pending',
      reference: 'RENT-002'
    },
    {
      id: 'TXN-004',
      type: 'expense',
      category: 'تأمين',
      description: 'تأمين عقاري سنوي',
      amount: 300,
      date: new Date(Date.now() - 259200000).toISOString(),
      propertyId: 'P-20250911120430',
      propertyName: 'شقة في مسقط',
      status: 'completed',
      reference: 'INS-001'
    },
    {
      id: 'TXN-005',
      type: 'income',
      category: 'إيجار',
      description: 'إيجار مكتب رقم 301',
      amount: 650,
      date: new Date(Date.now() - 345600000).toISOString(),
      propertyId: 'P-20250930145909',
      propertyName: 'فيلا في صلالة',
      status: 'overdue',
      reference: 'RENT-003'
    }
  ];
};

// قراءة المعاملات من الملف
const readTransactions = (): Transaction[] => {
  try {
    if (fs.existsSync(TRANSACTIONS_FILE)) {
      const data = fs.readFileSync(TRANSACTIONS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading transactions:', error);
  }
  
  // إنشاء بيانات تجريبية إذا لم تكن موجودة
  const sampleTransactions = createSampleTransactions();
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(sampleTransactions, null, 2));
  } catch (error) {
    console.error('Error creating sample transactions:', error);
  }
  
  return sampleTransactions;
};

// قراءة العقارات من الملف
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

// قراءة الحجوزات من الملف
const readBookings = (): Booking[] => {
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const data = fs.readFileSync(BOOKINGS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading bookings:', error);
  }
  return [];
};

// حساب البيانات المالية
const calculateFinancialData = (
  transactions: Transaction[],
  properties: Property[],
  bookings: Booking[],
  period: string = 'month'
): FinancialData => {
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
      startDate = new Date(0);
  }

  // تصفية المعاملات حسب الفترة
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= startDate;
  });

  // حساب الإيرادات والمصروفات
  const totalRevenue = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalRevenue - totalExpenses;

  // حساب الإيرادات الشهرية والسنوية
  const monthlyRevenue = transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return t.type === 'income' && transactionDate >= currentMonth && transactionDate < nextMonth;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const yearlyRevenue = transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      const currentYear = new Date(now.getFullYear(), 0, 1);
      const nextYear = new Date(now.getFullYear() + 1, 0, 1);
      return t.type === 'income' && transactionDate >= currentYear && transactionDate < nextYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  // حساب معدل الإشغال
  const totalProperties = properties.length;
  const occupiedProperties = bookings.filter(b => 
    ['reserved', 'leased', 'completed'].includes(b.status)
  ).length;
  const occupancyRate = totalProperties > 0 ? Math.round((occupiedProperties / totalProperties) * 100) : 0;

  // حساب متوسط الإيجار
  const totalRent = properties.reduce((sum, p) => {
    return sum + (p.priceMonthly || p.priceOMR || 0);
  }, 0);
  const averageRent = totalProperties > 0 ? totalRent / totalProperties : 0;

  // حساب المدفوعات المعلقة والمتأخرة
  const pendingPayments = bookings
    .filter(b => b.status === 'awaiting_payment')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const overduePayments = bookings
    .filter(b => {
      const bookingDate = new Date(b.createdAt);
      const daysDiff = Math.floor((now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
      return b.status === 'awaiting_payment' && daysDiff > 7;
    })
    .reduce((sum, b) => sum + b.totalAmount, 0);

  return {
    totalRevenue,
    monthlyRevenue,
    yearlyRevenue,
    totalExpenses,
    netProfit,
    occupancyRate,
    averageRent,
    pendingPayments,
    overduePayments
  };
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { period = 'month', property = 'all' } = req.query;

    // قراءة البيانات
    const transactions = readTransactions();
    const properties = readProperties();
    const bookings = readBookings();

    // تصفية المعاملات حسب العقار إذا تم تحديده
    let filteredTransactions = transactions;
    if (property !== 'all') {
      filteredTransactions = transactions.filter(t => t.propertyId === property);
    }

    // حساب البيانات المالية
    const financialData = calculateFinancialData(filteredTransactions, properties, bookings, period as string);

    res.status(200).json(financialData);
  } catch (error) {
    console.error('Error in finance API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
