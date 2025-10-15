// src/pages/api/customers.ts - API العملاء
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  dateOfBirth?: string;
  nationality?: string;
  idNumber?: string;
  occupation?: string;
  company?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');

// قراءة العملاء
const readCustomers = (): Customer[] => {
  try {
    if (fs.existsSync(CUSTOMERS_FILE)) {
      const data = fs.readFileSync(CUSTOMERS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      // تأكد من أن النتيجة array
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (parsed && Array.isArray(parsed.customers)) {
        return parsed.customers;
      }
    }
  } catch (error) {
    console.error('Error reading customers:', error);
  }
  return [];
};

// كتابة العملاء
const writeCustomers = (customers: Customer[]): void => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(customers, null, 2));
  } catch (error) {
    console.error('Error writing customers:', error);
    throw error;
  }
};

// إنشاء عميل جديد
const createCustomer = (customerData: Partial<Customer>): Customer => {
  const now = new Date().toISOString();
  const id = `CUST-${Date.now()}`;
  
  return {
    id,
    name: customerData.name || '',
    email: customerData.email || '',
    phone: customerData.phone || '',
    address: customerData.address,
    city: customerData.city,
    country: customerData.country || 'عُمان',
    dateOfBirth: customerData.dateOfBirth,
    nationality: customerData.nationality || 'عُماني',
    idNumber: customerData.idNumber,
    occupation: customerData.occupation,
    company: customerData.company,
    emergencyContact: customerData.emergencyContact,
    emergencyPhone: customerData.emergencyPhone,
    notes: customerData.notes,
    status: customerData.status || 'active',
    createdAt: now,
    updatedAt: now
  };
};

// إنشاء بيانات تجريبية للعملاء
const createSampleCustomers = (): Customer[] => {
  const sampleCustomers: Customer[] = [
    {
      id: 'CUST-001',
      name: 'أحمد محمد العبري',
      email: 'ahmed.albri@example.com',
      phone: '+968 1234 5678',
      address: 'شارع السلطان قابوس، مسقط',
      city: 'مسقط',
      country: 'عُمان',
      dateOfBirth: '1985-03-15',
      nationality: 'عُماني',
      idNumber: '1234567890',
      occupation: 'مهندس',
      company: 'شركة النهضة',
      emergencyContact: 'فاطمة العبري',
      emergencyPhone: '+968 9876 5432',
      notes: 'عميل مميز، دفع منتظم',
      status: 'active',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'CUST-002',
      name: 'فاطمة علي الشنفري',
      email: 'fatima.shanfari@example.com',
      phone: '+968 9876 5432',
      address: 'حي الغبرة، مسقط',
      city: 'مسقط',
      country: 'عُمان',
      dateOfBirth: '1990-07-22',
      nationality: 'عُماني',
      idNumber: '0987654321',
      occupation: 'طبيبة',
      company: 'مستشفى السلطان قابوس',
      emergencyContact: 'علي الشنفري',
      emergencyPhone: '+968 5555 1234',
      notes: 'عميلة جديدة، تحتاج متابعة',
      status: 'active',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'CUST-003',
      name: 'محمد سالم الكندي',
      email: 'mohammed.kindi@example.com',
      phone: '+968 7777 8888',
      address: 'حي العذيبة، مسقط',
      city: 'مسقط',
      country: 'عُمان',
      dateOfBirth: '1988-11-08',
      nationality: 'عُماني',
      idNumber: '1122334455',
      occupation: 'محاسب',
      company: 'شركة الكندي للمحاسبة',
      emergencyContact: 'سالم الكندي',
      emergencyPhone: '+968 9999 0000',
      notes: 'عميل موثوق، دفع مقدم',
      status: 'active',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'CUST-004',
      name: 'عائشة حسن المطيري',
      email: 'aisha.mutairi@example.com',
      phone: '+968 3333 4444',
      address: 'حي القرم، مسقط',
      city: 'مسقط',
      country: 'عُمان',
      dateOfBirth: '1992-05-12',
      nationality: 'عُماني',
      idNumber: '5566778899',
      occupation: 'معلمة',
      company: 'وزارة التربية والتعليم',
      emergencyContact: 'حسن المطيري',
      emergencyPhone: '+968 2222 3333',
      notes: 'عميلة نشطة، تفضل التواصل عبر البريد الإلكتروني',
      status: 'active',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'CUST-005',
      name: 'خالد عبدالله الرواحي',
      email: 'khalid.ruwahi@example.com',
      phone: '+968 6666 7777',
      address: 'حي الموالح، مسقط',
      city: 'مسقط',
      country: 'عُمان',
      dateOfBirth: '1983-09-30',
      nationality: 'عُماني',
      idNumber: '9988776655',
      occupation: 'تاجر',
      company: 'شركة الرواحي التجارية',
      emergencyContact: 'عبدالله الرواحي',
      emergencyPhone: '+968 1111 2222',
      notes: 'عميل VIP، لديه عدة عقارات',
      status: 'active',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  return sampleCustomers;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // قراءة العملاء
        let customers = readCustomers();
        
        // إنشاء بيانات تجريبية إذا لم تكن موجودة
        if (customers.length === 0) {
          customers = createSampleCustomers();
          writeCustomers(customers);
        }

        const { search, status, city, sortBy = 'name', sortOrder = 'asc' } = req.query;

        // تطبيق الفلاتر
        let filteredCustomers = [...customers];

        if (search) {
          const searchTerm = (search as string).toLowerCase();
          filteredCustomers = filteredCustomers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm) ||
            customer.email.toLowerCase().includes(searchTerm) ||
            customer.phone.includes(searchTerm) ||
            customer.idNumber?.includes(searchTerm)
          );
        }

        if (status && status !== 'all') {
          filteredCustomers = filteredCustomers.filter(customer => customer.status === status);
        }

        if (city && city !== 'all') {
          filteredCustomers = filteredCustomers.filter(customer => customer.city === city);
        }

        // ترتيب النتائج
        filteredCustomers.sort((a, b) => {
          let aValue: any, bValue: any;
          
          switch (sortBy) {
            case 'name':
              aValue = a.name;
              bValue = b.name;
              break;
            case 'email':
              aValue = a.email;
              bValue = b.email;
              break;
            case 'phone':
              aValue = a.phone;
              bValue = b.phone;
              break;
            case 'createdAt':
              aValue = new Date(a.createdAt);
              bValue = new Date(b.createdAt);
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

        res.status(200).json({
          customers: filteredCustomers,
          total: filteredCustomers.length,
          filters: {
            search,
            status,
            city,
            sortBy,
            sortOrder
          }
        });
        break;

      case 'POST':
        // إنشاء عميل جديد
        const { 
          name, 
          email, 
          phone, 
          address, 
          city: customerCity, 
          country, 
          dateOfBirth, 
          nationality, 
          idNumber, 
          occupation, 
          company, 
          emergencyContact, 
          emergencyPhone, 
          notes,
          status: customerStatus = 'active'
        } = req.body;

        if (!name || !email || !phone) {
          return res.status(400).json({
            error: 'Missing required fields: name, email, phone'
          });
        }

        // التحقق من عدم تكرار البريد الإلكتروني
        const existingCustomers = readCustomers();
        const emailExists = existingCustomers.some(c => c.email === email);
        if (emailExists) {
          return res.status(400).json({
            error: 'Email already exists'
          });
        }

        const newCustomer = createCustomer({
          name,
          email,
          phone,
          address,
          city: customerCity,
          country,
          dateOfBirth,
          nationality,
          idNumber,
          occupation,
          company,
          emergencyContact,
          emergencyPhone,
          notes,
          status: customerStatus
        });

        const updatedCustomers = [...existingCustomers, newCustomer];
        writeCustomers(updatedCustomers);

        res.status(201).json({
          message: 'Customer created successfully',
          customer: newCustomer
        });
        break;

      case 'PUT':
        // تحديث عميل
        const { id, ...updateData } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'Customer ID is required' });
        }

        const allCustomers = readCustomers();
        const customerIndex = allCustomers.findIndex(c => c.id === id);

        if (customerIndex === -1) {
          return res.status(404).json({ error: 'Customer not found' });
        }

        const updatedCustomer = {
          ...allCustomers[customerIndex],
          ...updateData,
          updatedAt: new Date().toISOString()
        };

        allCustomers[customerIndex] = updatedCustomer;
        writeCustomers(allCustomers);

        res.status(200).json({
          message: 'Customer updated successfully',
          customer: updatedCustomer
        });
        break;

      case 'DELETE':
        // حذف عميل
        const { id: deleteId } = req.query;

        if (!deleteId) {
          return res.status(400).json({ error: 'Customer ID is required' });
        }

        const customersToDelete = readCustomers();
        const deleteIndex = customersToDelete.findIndex(c => c.id === deleteId);

        if (deleteIndex === -1) {
          return res.status(404).json({ error: 'Customer not found' });
        }

        customersToDelete.splice(deleteIndex, 1);
        writeCustomers(customersToDelete);

        res.status(200).json({
          message: 'Customer deleted successfully'
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Error in customers API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
