// src/pages/api/tenants/send-credentials.ts - إرسال بيانات الدخول للمستأجر
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

    // إرسال عبر البريد الإلكتروني
    if (method === 'email' || method === 'both') {
      const emailContent = `
        مرحباً ${tenant.name},
        
        تم اعتماد حسابك في منصة عين عُمان!
        
        بيانات الدخول:
        اسم المستخدم: ${tenant.credentials.username}
        الرقم السري: ${tenant.credentials.password}
        
        رابط الدخول: https://ainoman.om/login
        
        يرجى تغيير كلمة المرور بعد أول تسجيل دخول.
        
        مع تحيات،
        فريق عين عُمان
      `;
      
      // TODO: إرسال البريد الفعلي
      console.log('📧 Email to:', tenant.email);
      console.log(emailContent);
      
      tenant.credentials.sentViaEmail = true;
      tenant.credentials.emailSentAt = new Date().toISOString();
    }

    // إرسال عبر الواتساب (الطريقة الأساسية)
    if (method === 'whatsapp' || method === 'both') {
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
      
      // تنظيف رقم الهاتف (إزالة المسافات والأحرف غير الرقمية)
      const cleanPhone = tenant.phone.replace(/\D/g, '');
      
      // رابط واتساب (يفتح محادثة مع الرسالة جاهزة)
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;
      
      // TODO: يمكن استخدام WhatsApp Business API للإرسال التلقائي
      console.log('📱 WhatsApp to:', tenant.phone);
      console.log('🔗 WhatsApp URL:', whatsappUrl);
      console.log('💬 Message:', whatsappMessage);
      
      tenant.credentials.sentViaWhatsApp = true;
      tenant.credentials.whatsappSentAt = new Date().toISOString();
      tenant.credentials.whatsappUrl = whatsappUrl; // حفظ الرابط للإرسال اليدوي
    }

    // إرسال عبر SMS (احتياطي)
    if (method === 'sms') {
      const smsContent = `
عين عُمان: تم اعتماد حسابك
اسم المستخدم: ${tenant.credentials.username}
الرقم السري: ${tenant.credentials.password}
رابط الدخول: ainoman.om/login
      `.trim();
      
      // TODO: إرسال SMS الفعلي (Twilio/Vonage)
      console.log('📱 SMS to:', tenant.phone);
      console.log(smsContent);
      
      tenant.credentials.sentViaSMS = true;
      tenant.credentials.smsSentAt = new Date().toISOString();
    }

    // تحديث البيانات
    const tenantIndex = users.findIndex((u: any) => u.id === tenantId);
    users[tenantIndex] = tenant;

    // حفظ الملف
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');

    res.status(200).json({ 
      success: true,
      message: 'تم إرسال بيانات الدخول بنجاح',
      sentVia: method,
      whatsappUrl: tenant.credentials.whatsappUrl, // رابط الواتساب للإرسال اليدوي
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

