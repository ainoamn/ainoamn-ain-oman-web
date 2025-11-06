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

    // التحقق من عدم تكرار رقم البطاقة المدنية/الإقامة/السجل التجاري
    let documentId = '';
    let documentType = '';
    
    if (type === 'individual_omani') {
      documentId = getField('nationalId');
      documentType = 'الرقم المدني';
    } else if (type === 'individual_foreign') {
      documentId = getField('residenceId');
      documentType = 'رقم بطاقة الإقامة';
    } else if (type === 'company') {
      documentId = getField('commercialRegister');
      documentType = 'رقم السجل التجاري';
    }

    if (documentId) {
      const existingTenant = users.find((u: any) => {
        if (u.role !== 'tenant' || !u.tenantDetails) return false;
        
        return u.tenantDetails.nationalId === documentId ||
               u.tenantDetails.residenceId === documentId ||
               u.tenantDetails.commercialRegister === documentId;
      });
      
      if (existingTenant) {
        return res.status(400).json({ 
          error: `مستأجر موجود مسبقاً بنفس ${documentType}: ${documentId}`,
          existingTenant: {
            id: existingTenant.id,
            name: existingTenant.name,
            email: existingTenant.email
          }
        });
      }
    }

    // إنشاء ID جديد للمستأجر
    const tenantCount = users.filter((u: any) => u.role === 'tenant').length;
    const newTenantId = `TENANT-${String(tenantCount + 1).padStart(3, '0')}`;
    
    // توليد اسم مستخدم بصيغة: T-XX12345678
    // T- + أول حرفين من الاسم (كبتل) + الرقم المدني
    const generateUsername = (name: string, nationalId: string): string => {
      // استخراج أول حرفين من الاسم
      const names = name.trim().split(' ');
      const firstName = names[0] || 'TN';
      const firstTwoLetters = firstName.substring(0, 2).toUpperCase();
      
      // تنظيف الرقم المدني من أي فواصل
      const cleanNationalId = nationalId.replace(/[^0-9]/g, '');
      
      return `T-${firstTwoLetters}${cleanNationalId}`;
    };
    
    const generatePassword = (): string => {
      // توليد رقم سري قوي: حروف كبيرة + صغيرة + أرقام
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
      const numbers = '0123456789';
      const special = '@#$!';
      
      let password = '';
      password += chars[Math.floor(Math.random() * chars.length)].toUpperCase(); // حرف كبير
      password += chars[Math.floor(Math.random() * chars.length)].toLowerCase(); // حرف صغير
      password += numbers[Math.floor(Math.random() * numbers.length)]; // رقم
      password += special[Math.floor(Math.random() * special.length)]; // رمز
      
      // إكمال ب 4 أحرف عشوائية
      for (let i = 0; i < 4; i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
      }
      
      // خلط الأحرف
      return password.split('').sort(() => Math.random() - 0.5).join('');
    };
    
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

    // توليد اسم المستخدم والرقم السري
    // استخدام الرقم المدني من البيانات
    const nationalIdForUsername = type === 'individual_omani' ? getField('nationalId') : 
                                   type === 'individual_foreign' ? getField('residenceId') :
                                   getField('commercialRegister');
    const username = generateUsername(name, nationalIdForUsername);
    const autoPassword = generatePassword();

    // إنشاء المستأجر الجديد
    const newTenant = {
      id: newTenantId,
      name,
      email,
      username, // اسم المستخدم المولد تلقائياً
      password: autoPassword, // الرقم السري المولد تلقائياً
      phone: tenantDetails.phone1,
      role: 'tenant',
      status: 'pending_approval', // معلق - بانتظار الاعتماد
      accountStatus: 'pending_contract', // بانتظار اعتماد العقد
      isVerified: false,
      permissions: [],
      // بيانات الدخول (للإرسال لاحقاً)
      credentials: {
        username,
        password: autoPassword,
        sentViaEmail: false,
        sentViaSMS: false,
        approvedBy: null,
        approvedAt: null,
        contractApproved: false,
        ownerApproved: false,
        tenantApproved: false,
        adminApproved: false
      },
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
