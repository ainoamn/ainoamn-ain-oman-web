// src/pages/api/tenants/send-credentials.ts - إرسال بيانات الدخول للمستأجر (تلقائي)
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { sendTenantCredentials } from '@/lib/messaging';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tenantId, method } = req.body;
    // method: 'email' | 'whatsapp' | 'both' | 'sms' (SMS للاحتياط فقط)
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Missing tenant ID' });
    }

    // قراءة ملف المستخدمين
    const usersPath = path.join(process.cwd(), '.data', 'users.json');
    const usersData = fs.readFileSync(usersPath, 'utf-8');
    const users = JSON.parse(usersData);

    // إيجاد المستأجر
    const tenant = users.find((u: any) => u.id === tenantId && u.role === 'tenant');
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // التحقق من أن الحساب معتمد
    if (tenant.status !== 'active') {
      return res.status(400).json({ error: 'Tenant account not approved yet' });
    }

    if (!tenant.credentials || !tenant.credentials.username || !tenant.credentials.password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    // إرسال تلقائي عبر الواتساب والبريد باستخدام المكتبة
    const sendResults = await sendTenantCredentials(
      tenant.name,
      tenant.email,
      tenant.phone,
      tenant.credentials.username,
      tenant.credentials.password
    );

    // تحديث حالة الإرسال
    tenant.credentials.sentViaWhatsApp = sendResults.whatsapp.success;
    tenant.credentials.whatsappMessageId = sendResults.whatsapp.messageId;
    tenant.credentials.whatsappSentAt = sendResults.whatsapp.success ? new Date().toISOString() : null;
    tenant.credentials.whatsappError = sendResults.whatsapp.error;

    tenant.credentials.sentViaEmail = sendResults.email.success;
    tenant.credentials.emailMessageId = sendResults.email.messageId;
    tenant.credentials.emailSentAt = sendResults.email.success ? new Date().toISOString() : null;
    tenant.credentials.emailError = sendResults.email.error;

    // للتوافق مع الكود الحالي - إنشاء رابط واتساب للإرسال اليدوي (احتياطي)
    const cleanPhone = tenant.phone.replace(/\D/g, '');
    const whatsappMessage = `
🎉 *مرحباً ${tenant.name}*

تم اعتماد حسابك في منصة *عين عُمان*! ✅

*بيانات الدخول:*
• اسم المستخدم: \`${tenant.credentials.username}\`
• الرقم السري: \`${tenant.credentials.password}\`

🔗 *رابط الدخول:*
https://ainoman.om/login

⚠️ *ملاحظة هامة:*
يرجى تغيير كلمة المرور بعد أول تسجيل دخول

_مع تحيات فريق عين عُمان_ 🏢
    `.trim();
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;
    tenant.credentials.whatsappUrl = whatsappUrl;

    // تحديث البيانات
    const tenantIndex = users.findIndex((u: any) => u.id === tenantId);
    users[tenantIndex] = tenant;

    // حفظ الملف
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');

    res.status(200).json({ 
      success: true,
      message: sendResults.whatsapp.success && sendResults.email.success
        ? 'تم إرسال بيانات الدخول عبر الواتساب والبريد بنجاح'
        : sendResults.whatsapp.success
        ? 'تم إرسال بيانات الدخول عبر الواتساب فقط'
        : sendResults.email.success
        ? 'تم إرسال بيانات الدخول عبر البريد فقط'
        : 'فشل إرسال بيانات الدخول',
      sentVia: method,
      results: {
        whatsapp: {
          success: sendResults.whatsapp.success,
          messageId: sendResults.whatsapp.messageId,
          error: sendResults.whatsapp.error
        },
        email: {
          success: sendResults.email.success,
          messageId: sendResults.email.messageId,
          error: sendResults.email.error
        }
      },
      whatsappUrl: tenant.credentials.whatsappUrl, // رابط احتياطي للإرسال اليدوي
      credentials: {
        username: tenant.credentials.username,
        // لا نرسل الرقم السري في الاستجابة للأمان
      }
    });
  } catch (error) {
    console.error('Error sending credentials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

