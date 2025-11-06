// src/pages/api/users/update-tenant.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'tenants');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024 // 10MB
  });

  try {
    const [fields, files] = await form.parse(req);

    const getField = (name: string) => {
      const value = fields[name];
      return Array.isArray(value) ? value[0] : value || '';
    };

    const getFile = (name: string) => {
      const file = files[name];
      return Array.isArray(file) ? file[0] : file;
    };

    const tenantId = getField('id');
    const tenantType = getField('tenantType');
    const name = getField('name');
    const email = getField('email');
    const phone = getField('phone');
    const status = getField('status');

    if (!tenantId || !name || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // قراءة users.json
    const usersPath = path.join(process.cwd(), '.data', 'users.json');
    const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    const users = Array.isArray(usersData) ? usersData : (usersData.users || []);

    // البحث عن المستأجر
    const tenantIndex = users.findIndex((u: any) => u.id === tenantId);
    if (tenantIndex === -1) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // معالجة رفع الملفات
    const saveFile = (file: any) => {
      if (!file) return null;
      const relativePath = `/uploads/tenants/${path.basename(file.filepath)}`;
      return relativePath;
    };

    let tenantDetails: any = users[tenantIndex].tenantDetails || { type: tenantType };

    if (tenantType === 'individual_omani') {
      tenantDetails = {
        type: 'individual_omani',
        fullName: getField('fullName'),
        tribe: getField('tribe'),
        nationalId: getField('nationalId'),
        nationalIdExpiry: getField('nationalIdExpiry'),
        nationalIdAttachment: saveFile(getFile('nationalIdFile')) || tenantDetails.nationalIdAttachment,
        phone1: getField('phone1'),
        phone2: getField('phone2'),
        employer: getField('employer'),
        address: getField('address')
      };
    } else if (tenantType === 'individual_foreign') {
      tenantDetails = {
        type: 'individual_foreign',
        fullName: getField('fullName'),
        residenceId: getField('residenceId'),
        residenceIdExpiry: getField('residenceIdExpiry'),
        residenceIdAttachment: saveFile(getFile('residenceIdFile')) || tenantDetails.residenceIdAttachment,
        passportNumber: getField('passportNumber'),
        passportExpiry: getField('passportExpiry'),
        passportAttachment: saveFile(getFile('passportFile')) || tenantDetails.passportAttachment,
        phone1: getField('phone1'),
        phone2: getField('phone2'),
        employer: getField('employer'),
        employerPhone: getField('employerPhone'),
        address: getField('address')
      };
    } else if (tenantType === 'company') {
      const emergencyContactsStr = getField('emergencyContacts');
      const authorizedSignatoriesStr = getField('authorizedSignatories');

      tenantDetails = {
        type: 'company',
        companyName: getField('companyName'),
        commercialRegister: getField('commercialRegister'),
        commercialRegisterExpiry: getField('commercialRegisterExpiry'),
        commercialRegisterAttachment: saveFile(getFile('commercialRegisterFile')) || tenantDetails.commercialRegisterAttachment,
        establishmentDate: getField('establishmentDate'),
        headquarters: getField('headquarters'),
        companyPhone: getField('companyPhone'),
        emergencyContacts: emergencyContactsStr ? JSON.parse(emergencyContactsStr) : [],
        authorizedSignatories: authorizedSignatoriesStr ? JSON.parse(authorizedSignatoriesStr) : []
      };
    }

    // تحديث المستأجر
    users[tenantIndex] = {
      ...users[tenantIndex],
      name,
      email,
      phone,
      status,
      tenantDetails,
      updatedAt: new Date().toISOString()
    };

    // حفظ التحديثات
    const dataToSave = Array.isArray(usersData) ? users : { ...usersData, users };
    fs.writeFileSync(usersPath, JSON.stringify(dataToSave, null, 2), 'utf-8');

    return res.status(200).json(users[tenantIndex]);
  } catch (error) {
    console.error('Error updating tenant:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

