// src/pages/api/billing/invoices.ts - API الفواتير
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  propertyId: string;
  propertyName: string;
  amount: number;
  tax: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  issueDate: string;
  paidDate?: string;
  description: string;
  items: InvoiceItem[];
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
}

interface Property {
  id: string;
  title: string;
  priceMonthly?: number;
  priceOMR?: number;
  status?: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const INVOICES_FILE = path.join(DATA_DIR, 'invoices.json');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');

// قراءة العملاء
const readCustomers = (): Customer[] => {
  try {
    if (fs.existsSync(CUSTOMERS_FILE)) {
      const data = fs.readFileSync(CUSTOMERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading customers:', error);
  }
  return [];
};

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

// قراءة الفواتير
const readInvoices = (): Invoice[] => {
  try {
    if (fs.existsSync(INVOICES_FILE)) {
      const data = fs.readFileSync(INVOICES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading invoices:', error);
  }
  return [];
};

// كتابة الفواتير
const writeInvoices = (invoices: Invoice[]): void => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(INVOICES_FILE, JSON.stringify(invoices, null, 2));
  } catch (error) {
    console.error('Error writing invoices:', error);
    throw error;
  }
};

// إنشاء فاتورة جديدة
const createInvoice = (invoiceData: Partial<Invoice>): Invoice => {
  const now = new Date().toISOString();
  const id = `INV-${Date.now()}`;
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  
  // حساب المبلغ الإجمالي
  const items = invoiceData.items || [];
  const amount = items.reduce((sum, item) => sum + item.total, 0);
  const tax = amount * 0.05; // 5% ضريبة
  const totalAmount = amount + tax;

  return {
    id,
    invoiceNumber,
    customerId: invoiceData.customerId || '',
    customerName: invoiceData.customerName || '',
    customerEmail: invoiceData.customerEmail || '',
    customerPhone: invoiceData.customerPhone || '',
    propertyId: invoiceData.propertyId || '',
    propertyName: invoiceData.propertyName || '',
    amount,
    tax,
    totalAmount,
    status: invoiceData.status || 'draft',
    dueDate: invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    issueDate: invoiceData.issueDate || now,
    paidDate: invoiceData.paidDate,
    description: invoiceData.description || '',
    items,
    paymentMethod: invoiceData.paymentMethod,
    notes: invoiceData.notes,
    createdAt: now,
    updatedAt: now
  };
};

// إنشاء بيانات تجريبية للفواتير
const createSampleInvoices = (): Invoice[] => {
  const customers = readCustomers();
  const properties = readProperties();
  
  if (customers.length === 0 || properties.length === 0) {
    return [];
  }

  const sampleInvoices: Invoice[] = [
    {
      id: 'INV-001',
      invoiceNumber: 'INV-2024-001',
      customerId: customers[0]?.id || 'CUST-001',
      customerName: customers[0]?.name || 'أحمد محمد',
      customerEmail: customers[0]?.email || 'ahmed@example.com',
      customerPhone: customers[0]?.phone || '+968 1234 5678',
      propertyId: properties[0]?.id || 'P-001',
      propertyName: properties[0]?.title || 'شقة في مسقط',
      amount: 450,
      tax: 22.5,
      totalAmount: 472.5,
      status: 'paid',
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      issueDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      paidDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'إيجار شهري - شقة في مسقط',
      items: [
        {
          id: 'ITEM-001',
          description: 'إيجار شهري',
          quantity: 1,
          unitPrice: 450,
          total: 450,
          category: 'إيجار'
        }
      ],
      paymentMethod: 'credit_card',
      notes: 'تم الدفع عبر البطاقة الائتمانية',
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'INV-002',
      invoiceNumber: 'INV-2024-002',
      customerId: customers[1]?.id || 'CUST-002',
      customerName: customers[1]?.name || 'فاطمة علي',
      customerEmail: customers[1]?.email || 'fatima@example.com',
      customerPhone: customers[1]?.phone || '+968 9876 5432',
      propertyId: properties[1]?.id || 'P-002',
      propertyName: properties[1]?.title || 'فيلا في صلالة',
      amount: 800,
      tax: 40,
      totalAmount: 840,
      status: 'sent',
      dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      issueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'إيجار شهري - فيلا في صلالة',
      items: [
        {
          id: 'ITEM-002',
          description: 'إيجار شهري',
          quantity: 1,
          unitPrice: 800,
          total: 800,
          category: 'إيجار'
        }
      ],
      paymentMethod: 'bank_transfer',
      notes: 'في انتظار التحويل البنكي',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'INV-003',
      invoiceNumber: 'INV-2024-003',
      customerId: customers[0]?.id || 'CUST-001',
      customerName: customers[0]?.name || 'أحمد محمد',
      customerEmail: customers[0]?.email || 'ahmed@example.com',
      customerPhone: customers[0]?.phone || '+968 1234 5678',
      propertyId: properties[0]?.id || 'P-001',
      propertyName: properties[0]?.title || 'شقة في مسقط',
      amount: 120,
      tax: 6,
      totalAmount: 126,
      status: 'overdue',
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      issueDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'رسوم صيانة - مكيف الهواء',
      items: [
        {
          id: 'ITEM-003',
          description: 'صيانة مكيف الهواء',
          quantity: 1,
          unitPrice: 120,
          total: 120,
          category: 'صيانة'
        }
      ],
      paymentMethod: 'cash',
      notes: 'متأخر عن موعد الاستحقاق',
      createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  return sampleInvoices;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // قراءة الفواتير
        let invoices = readInvoices();
        
        // إنشاء بيانات تجريبية إذا لم تكن موجودة
        if (invoices.length === 0) {
          invoices = createSampleInvoices();
          if (invoices.length > 0) {
            writeInvoices(invoices);
          }
        }

        // ربط أسماء العملاء والعقارات
        const customers = readCustomers();
        const properties = readProperties();
        
        const enrichedInvoices = invoices.map(invoice => {
          const customer = customers.find(c => c.id === invoice.customerId);
          const property = properties.find(p => p.id === invoice.propertyId);
          
          return {
            ...invoice,
            customerName: customer?.name || invoice.customerName,
            customerEmail: customer?.email || invoice.customerEmail,
            customerPhone: customer?.phone || invoice.customerPhone,
            propertyName: property?.title || invoice.propertyName
          };
        });

        res.status(200).json({
          invoices: enrichedInvoices,
          total: enrichedInvoices.length
        });
        break;

      case 'POST':
        // إنشاء فاتورة جديدة
        const { 
          customerId, 
          propertyId, 
          description, 
          items, 
          dueDate, 
          notes,
          status = 'draft'
        } = req.body;

        if (!customerId || !propertyId || !items || !Array.isArray(items)) {
          return res.status(400).json({
            error: 'Missing required fields: customerId, propertyId, items'
          });
        }

        // الحصول على بيانات العميل والعقار
        const customers = readCustomers();
        const properties = readProperties();
        const customer = customers.find(c => c.id === customerId);
        const property = properties.find(p => p.id === propertyId);

        if (!customer || !property) {
          return res.status(400).json({
            error: 'Customer or property not found'
          });
        }

        const newInvoice = createInvoice({
          customerId,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          propertyId,
          propertyName: property.title,
          description,
          items,
          dueDate,
          notes,
          status
        });

        const existingInvoices = readInvoices();
        const updatedInvoices = [...existingInvoices, newInvoice];
        writeInvoices(updatedInvoices);

        res.status(201).json({
          message: 'Invoice created successfully',
          invoice: newInvoice
        });
        break;

      case 'PUT':
        // تحديث فاتورة
        const { id, ...updateData } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'Invoice ID is required' });
        }

        const allInvoices = readInvoices();
        const invoiceIndex = allInvoices.findIndex(i => i.id === id);

        if (invoiceIndex === -1) {
          return res.status(404).json({ error: 'Invoice not found' });
        }

        // إعادة حساب المبالغ إذا تم تحديث العناصر
        let updatedInvoice = { ...allInvoices[invoiceIndex], ...updateData };
        if (updateData.items) {
          const amount = updateData.items.reduce((sum: number, item: InvoiceItem) => sum + item.total, 0);
          const tax = amount * 0.05;
          updatedInvoice = {
            ...updatedInvoice,
            amount,
            tax,
            totalAmount: amount + tax
          };
        }

        updatedInvoice.updatedAt = new Date().toISOString();
        allInvoices[invoiceIndex] = updatedInvoice;
        writeInvoices(allInvoices);

        res.status(200).json({
          message: 'Invoice updated successfully',
          invoice: updatedInvoice
        });
        break;

      case 'DELETE':
        // حذف فاتورة
        const { id: deleteId } = req.query;

        if (!deleteId) {
          return res.status(400).json({ error: 'Invoice ID is required' });
        }

        const invoicesToDelete = readInvoices();
        const deleteIndex = invoicesToDelete.findIndex(i => i.id === deleteId);

        if (deleteIndex === -1) {
          return res.status(404).json({ error: 'Invoice not found' });
        }

        invoicesToDelete.splice(deleteIndex, 1);
        writeInvoices(invoicesToDelete);

        res.status(200).json({
          message: 'Invoice deleted successfully'
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Error in invoices API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
