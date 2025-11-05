// src/pages/api/tenants/approve.ts - اعتماد المستأجر وتفعيل الحساب
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tenantId, approvalType, approvedBy } = req.body;
    
    // approvalType: 'owner' | 'tenant' | 'admin'
    
    if (!tenantId || !approvalType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // قراءة ملف المستخدمين
    const usersPath = path.join(process.cwd(), '.data', 'users.json');
    const usersData = fs.readFileSync(usersPath, 'utf-8');
    const users = JSON.parse(usersData);

    // إيجاد المستأجر
    const tenantIndex = users.findIndex((u: any) => u.id === tenantId && u.role === 'tenant');
    
    if (tenantIndex === -1) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const tenant = users[tenantIndex];

    // تحديث الاعتماد
    if (!tenant.credentials) {
      tenant.credentials = {
        ownerApproved: false,
        tenantApproved: false,
        adminApproved: false
      };
    }

    if (approvalType === 'owner') {
      tenant.credentials.ownerApproved = true;
    } else if (approvalType === 'tenant') {
      tenant.credentials.tenantApproved = true;
    } else if (approvalType === 'admin') {
      tenant.credentials.adminApproved = true;
      tenant.credentials.approvedBy = approvedBy;
      tenant.credentials.approvedAt = new Date().toISOString();
    }

    // التحقق من اكتمال جميع الاعتمادات
    const allApproved = tenant.credentials.ownerApproved && 
                        tenant.credentials.tenantApproved && 
                        tenant.credentials.adminApproved;

    if (allApproved) {
      // تفعيل الحساب بالكامل
      tenant.status = 'active';
      tenant.accountStatus = 'active';
      tenant.isVerified = true;
      
      // الآن يمكن إرسال بيانات الدخول
      // يمكن إضافة نظام إرسال البريد/SMS هنا
    }

    // تحديث المستخدم
    users[tenantIndex] = tenant;

    // حفظ الملف
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');

    res.status(200).json({ 
      tenant,
      message: allApproved 
        ? 'تم اعتماد المستأجر وتفعيل الحساب بنجاح' 
        : `تم اعتماد ${approvalType} بنجاح`
    });
  } catch (error) {
    console.error('Error approving tenant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

