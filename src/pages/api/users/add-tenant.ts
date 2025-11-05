// src/pages/api/users/add-tenant.ts - إضافة مستأجر جديد مع دعم الأنواع الثلاثة
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false, // نحتاج لتعطيل body parser لاستخدام formidable
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse FormData
    const form = formidable({
      uploadDir: path.join(process.cwd(), 'public', 'uploads', 'tenants'),
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    // إنشاء مجلد uploads إذا لم يكن موجوداً
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'tenants');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const parseForm = () => new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const { fields, files } = await parseForm();

    // استخراج البيانات
    const getField = (field: string): string => {
      const value = fields[field];
      return Array.isArray(value) ? value[0] : value || '';
    };

    const getFilePath = (file: any): string | null => {
      if (!file) return null;
      const fileObj = Array.isArray(file) ? file[0] : file;
      if (!fileObj) return null;
      // formidable v3 uses newFilename
      const filename = fileObj.newFilename || path.basename(fileObj.filepath || fileObj.path || '');
      return filename ? `/uploads/tenants/${filename}` : null;
    };

    const type = getField('type') as 'individual_omani' | 'individual_foreign' | 'company';
    const email = getField('email');
    
    // التحقق من الحقول الأساسية
    if (!type || !email) {
      return res.status(400).json({ error: 'Missing required fields: type and email' });
    }

    // قراءة ملف المستخدمين
    const usersPath = path.join(process.cwd(), '.data', 'users.json');
    const usersData = fs.readFileSync(usersPath, 'utf-8');
    const users = JSON.parse(usersData);

    // التحقق من عدم وجود المستخدم بنفس البريد الإلكتروني
    const existingUser = users.find((u: any) => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // إنشاء ID جديد للمستأجر
    const tenantCount = users.filter((u: any) => u.role === 'tenant').length;
    const newTenantId = `TENANT-${String(tenantCount + 1).padStart(3, '0')}`;

    // إعداد بيانات المستأجر حسب النوع
    let name = '';
    let tenantDetails: any = {
      type,
      email,
      phone1: getField('phone1'),
      phone2: getField('phone2'),
      employer: getField('employer'),
      address: getField('address'),
    };

    if (type === 'individual_omani') {
      name = getField('fullName');
      tenantDetails = {
        ...tenantDetails,
        fullName: getField('fullName'),
        tribe: getField('tribe'),
        nationalId: getField('nationalId'),
        nationalIdExpiry: getField('nationalIdExpiry'),
        nationalIdFile: getFilePath(files.nationalIdFile),
      };
    } else if (type === 'individual_foreign') {
      name = getField('fullName');
      tenantDetails = {
        ...tenantDetails,
        fullName: getField('fullName'),
        residenceId: getField('residenceId'),
        residenceIdExpiry: getField('residenceIdExpiry'),
        residenceIdFile: getFilePath(files.residenceIdFile),
        passportNumber: getField('passportNumber'),
        passportExpiry: getField('passportExpiry'),
        passportFile: getFilePath(files.passportFile),
        employerPhone: getField('employerPhone'),
      };
    } else if (type === 'company') {
      name = getField('companyName');
      tenantDetails = {
        ...tenantDetails,
        companyName: getField('companyName'),
        commercialRegister: getField('commercialRegister'),
        commercialRegisterExpiry: getField('commercialRegisterExpiry'),
        establishmentDate: getField('establishmentDate'),
        commercialRegisterFile: getFilePath(files.commercialRegisterFile),
        headquarters: getField('headquarters'),
        companyPhone: getField('companyPhone'),
      };
    }

    // إنشاء المستأجر الجديد
    const newTenant = {
      id: newTenantId,
      name,
      email,
      password: `Tenant@${new Date().getFullYear()}`,
      phone: tenantDetails.phone1,
      role: 'tenant',
      status: 'active',
      isVerified: false,
      permissions: [],
      profile: {
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=14b8a6&color=fff&size=200`,
        company: type === 'company' ? name : '',
        location: tenantDetails.address || '',
        lastLogin: new Date().toISOString(),
        loginCount: 0
      },
      tenantDetails, // جميع التفاصيل الإضافية
      subscription: {
        plan: 'basic',
        planName: 'الخطة المجانية',
        status: 'active',
        expiresAt: '2099-12-31T23:59:59.999Z',
        remainingDays: 99999
      },
      stats: {
        properties: 0,
        units: 0,
        bookings: 0,
        revenue: 0,
        tasks: 0,
        legalCases: 0
      },
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    // إضافة المستأجر للمصفوفة
    users.push(newTenant);

    // حفظ الملف
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');

    res.status(200).json(newTenant);
  } catch (error) {
    console.error('Error adding tenant:', error);
    res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
  }
}
