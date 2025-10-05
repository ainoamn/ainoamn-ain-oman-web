// src/pages/api/properties/financial-summary.ts - API ملخص العقارات المالي
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface PropertyFinancial {
  id: string;
  name: string;
  monthlyRent: number;
  occupancyRate: number;
  totalRevenue: number;
  expenses: number;
  netProfit: number;
  lastPayment: string;
  nextPayment: string;
  status: string;
  type: string;
  location: string;
}

interface Property {
  id: string;
  title: string;
  priceMonthly?: number;
  priceOMR?: number;
  status?: string;
  type?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Booking {
  id: string;
  propertyId: string;
  propertyName: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  paymentStatus?: string;
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
}

const DATA_DIR = path.join(process.cwd(), '.data');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');

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

// قراءة الحجوزات
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

// حساب ملخص مالي للعقار
const calculatePropertyFinancial = (
  property: Property,
  bookings: Booking[],
  transactions: Transaction[]
): PropertyFinancial => {
  const propertyBookings = bookings.filter(b => b.propertyId === property.id);
  const propertyTransactions = transactions.filter(t => t.propertyId === property.id);

  // حساب الإيرادات
  const totalRevenue = propertyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // حساب المصروفات
  const expenses = propertyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // حساب صافي الربح
  const netProfit = totalRevenue - expenses;

  // حساب معدل الإشغال
  const occupiedBookings = propertyBookings.filter(b => 
    ['reserved', 'leased', 'completed'].includes(b.status)
  );
  const occupancyRate = propertyBookings.length > 0 
    ? Math.round((occupiedBookings.length / propertyBookings.length) * 100)
    : 0;

  // آخر دفعة
  const lastPayment = propertyTransactions
    .filter(t => t.type === 'income' && t.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  // الدفعة التالية (تقديرية - بعد شهر من آخر دفعة)
  const nextPayment = lastPayment 
    ? new Date(new Date(lastPayment.date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  return {
    id: property.id,
    name: property.title,
    monthlyRent: property.priceMonthly || property.priceOMR || 0,
    occupancyRate,
    totalRevenue,
    expenses,
    netProfit,
    lastPayment: lastPayment?.date || '',
    nextPayment,
    status: property.status || 'available',
    type: property.type || 'apartment',
    location: property.location || 'غير محدد'
  };
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { status, type, sortBy = 'name', sortOrder = 'asc' } = req.query;

    // قراءة البيانات
    const properties = readProperties();
    const bookings = readBookings();
    const transactions = readTransactions();

    // تصفية العقارات حسب الحالة والنوع
    let filteredProperties = properties;
    
    if (status && status !== 'all') {
      filteredProperties = filteredProperties.filter(p => p.status === status);
    }
    
    if (type && type !== 'all') {
      filteredProperties = filteredProperties.filter(p => p.type === type);
    }

    // حساب الملخص المالي لكل عقار
    const propertiesFinancial: PropertyFinancial[] = filteredProperties.map(property => 
      calculatePropertyFinancial(property, bookings, transactions)
    );

    // ترتيب النتائج
    propertiesFinancial.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'monthlyRent':
          aValue = a.monthlyRent;
          bValue = b.monthlyRent;
          break;
        case 'occupancyRate':
          aValue = a.occupancyRate;
          bValue = b.occupancyRate;
          break;
        case 'totalRevenue':
          aValue = a.totalRevenue;
          bValue = b.totalRevenue;
          break;
        case 'netProfit':
          aValue = a.netProfit;
          bValue = b.netProfit;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

    // حساب الإحصائيات الإجمالية
    const totalProperties = propertiesFinancial.length;
    const totalMonthlyRent = propertiesFinancial.reduce((sum, p) => sum + p.monthlyRent, 0);
    const totalRevenue = propertiesFinancial.reduce((sum, p) => sum + p.totalRevenue, 0);
    const totalExpenses = propertiesFinancial.reduce((sum, p) => sum + p.expenses, 0);
    const totalNetProfit = propertiesFinancial.reduce((sum, p) => sum + p.netProfit, 0);
    const averageOccupancyRate = totalProperties > 0 
      ? Math.round(propertiesFinancial.reduce((sum, p) => sum + p.occupancyRate, 0) / totalProperties)
      : 0;

    res.status(200).json({
      properties: propertiesFinancial,
      summary: {
        totalProperties,
        totalMonthlyRent,
        totalRevenue,
        totalExpenses,
        totalNetProfit,
        averageOccupancyRate
      },
      filters: {
        status,
        type,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Error in financial summary API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
