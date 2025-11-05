# 📱 دليل ربط نظام الرسائل التلقائي

## 📋 نظرة عامة

النظام جاهز للإرسال التلقائي الكامل عبر:
- ✅ **WhatsApp Business API** (الواتساب)
- ✅ **SendGrid / Mailgun** (البريد الإلكتروني)

---

## 🚀 الوضع الحالي

### Development Mode (محاكاة)
```
✅ يعمل: console.log للتطوير والاختبار
❌ لا يُرسل: رسائل حقيقية
🎯 الهدف: اختبار سير العمل بدون تكاليف
```

### Production Mode (إنتاج)
```
✅ إرسال حقيقي عبر APIs
✅ تتبع message IDs
✅ معالجة أخطاء كاملة
🔑 يتطلب: API keys في .env.local
```

---

## 📱 الخطوة 1: ربط WhatsApp Business API

### 1.1 الحصول على API Key

#### الطريقة 1: Meta Business (الرسمية)
```
1. اذهب لـ: https://business.facebook.com
2. أنشئ حساب Meta Business
3. سجل في WhatsApp Business Platform
4. احصل على:
   - Access Token
   - Phone Number ID
   - API URL
```

#### الطريقة 2: خدمات الطرف الثالث (أسهل)
- **Twilio WhatsApp**: https://www.twilio.com/whatsapp
- **MessageBird**: https://messagebird.com
- **Vonage**: https://www.vonage.com

### 1.2 إضافة API Keys

أنشئ ملف `.env.local` في جذر المشروع:

```bash
# WhatsApp Business API
WHATSAPP_API_URL=https://graph.facebook.com/v17.0
WHATSAPP_API_KEY=EAAxxxxxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789012345

# أو إذا كنت تستخدم Twilio:
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### 1.3 تفعيل الكود

في `src/lib/messaging.ts`، الكود جاهز! فقط أزل التعليق:

```typescript
// قبل (معلق):
// const response = await fetch(`${config.apiUrl}/${config.phoneNumberId}/messages`, {
//   ...
// });

// بعد (مفعّل):
const response = await fetch(`${config.apiUrl}/${config.phoneNumberId}/messages`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    messaging_product: 'whatsapp',
    to: cleanPhone,
    type: 'text',
    text: { body: message }
  })
});
```

---

## 📧 الخطوة 2: ربط البريد الإلكتروني

### 2.1 الخيار الأول: SendGrid (موصى به)

#### التسجيل:
```
1. اذهب لـ: https://sendgrid.com
2. أنشئ حساب مجاني (100 بريد/يوم)
3. احصل على API Key
4. تحقق من نطاقك (Domain Verification)
```

#### إضافة API Key:
```bash
# .env.local
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@ainoman.om
EMAIL_FROM_NAME=عين عُمان
```

#### تفعيل الكود:
في `src/lib/messaging.ts`:

```typescript
const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    personalizations: [{ to: [{ email: to }] }],
    from: { email: config.fromEmail, name: config.fromName },
    subject,
    content: [
      { type: 'text/html', value: htmlContent },
      { type: 'text/plain', value: textContent }
    ]
  })
});
```

### 2.2 الخيار الثاني: Mailgun

#### التسجيل:
```
1. اذهب لـ: https://www.mailgun.com
2. أنشئ حساب (5,000 بريد/شهر مجاناً)
3. احصل على API Key
4. أضف نطاقك
```

#### إضافة API Key:
```bash
# .env.local
MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxxxxxxxxxx
MAILGUN_DOMAIN=ainoman.om
EMAIL_FROM=noreply@ainoman.om
EMAIL_FROM_NAME=عين عُمان
```

---

## 🧪 الاختبار

### في Development Mode (الحالي):

```bash
# افتح Console (F12)
1. أضف مستأجر جديد
2. اعتمده
3. اضغط "إرسال بيانات الدخول"
4. ستظهر في Console:
   ✅ [WhatsApp API] Sending to: 96891234567
   ✅ [Email API] Sending to: mohammed@example.com
   ✅ [SIMULATED] Message sent successfully
```

### في Production Mode (مع API Keys):

```bash
# نفس الخطوات، لكن:
✅ رسالة واتساب حقيقية تُرسل للمستأجر
✅ بريد إلكتروني حقيقي يصل للمستأجر
✅ message IDs تُحفظ في users.json
```

---

## 📊 البيانات المحفوظة

بعد الإرسال الناجح، يُحفظ في `users.json`:

```json
{
  "id": "TENANT-004",
  "name": "محمد بن سالم الغافري",
  "username": "محمد_سالم_004",
  "password": "Nm7@kPqR",
  "status": "active",
  "credentials": {
    "username": "محمد_سالم_004",
    "password": "Nm7@kPqR",
    
    "sentViaWhatsApp": true,
    "whatsappMessageId": "wa_1730823456_abc123",
    "whatsappSentAt": "2025-11-05T14:30:00.000Z",
    
    "sentViaEmail": true,
    "emailMessageId": "email_1730823456_def456",
    "emailSentAt": "2025-11-05T14:30:00.000Z",
    
    "ownerApproved": true,
    "tenantApproved": true,
    "adminApproved": true,
    "approvedAt": "2025-11-05T14:25:00.000Z"
  }
}
```

---

## 🔐 الأمان

### 1. البيانات الحساسة
```
✅ الرقم السري: يُحفظ في users.json (للتطوير)
⚠️ للإنتاج: استخدم bcrypt للتشفير
✅ API Keys: في .env.local (غير مرفوع لـ Git)
```

### 2. .gitignore
تأكد من وجود:
```
.env.local
.env*.local
```

---

## 📝 ملاحظات مهمة

### 1. التكاليف
- **SendGrid Free:** 100 بريد/يوم
- **Mailgun Free:** 5,000 بريد/شهر
- **WhatsApp Business:** حسب Meta (عادة أول 1000 محادثة مجاناً)

### 2. القيود
- **WhatsApp:** يجب موافقة Meta على الرسائل Template
- **البريد:** يحتاج تحقق من النطاق (Domain Verification)

### 3. البدائل
- **WhatsApp:** يمكن استخدام Twilio API (أسهل)
- **البريد:** يمكن استخدام Gmail SMTP (للتطوير فقط)

---

## 🎯 الخطوات التالية

### للتطوير:
```
✅ النظام يعمل (محاكاة)
✅ اختبر سير العمل
✅ تأكد من جميع الميزات
```

### للإنتاج:
```
1. احصل على API keys
2. أضفها لـ .env.local
3. فعّل الكود في messaging.ts
4. اختبر مع رقم حقيقي
5. ✅ انشر!
```

---

## 📞 الدعم

إذا احتجت مساعدة في:
- إعداد WhatsApp Business API
- إعداد SendGrid/Mailgun
- تفعيل الكود

اسأل وسأساعدك! 🚀

---

**آخر تحديث:** 5 نوفمبر 2025  
**الحالة:** ✅ جاهز للإنتاج  
**الوضع الحالي:** Development Mode (محاكاة)

