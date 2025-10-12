# 🚀 دليل نشر Ain Oman على Vercel

## 📋 نظرة عامة

دليل شامل لحل مشكلة ربط GitHub مع Vercel ونشر المشروع على دومينك الخاص.

---

## ❌ المشكلة

```
Failed to link ainoamn/ainoamn-ain-oman-web. 
You need to add a Login Connection to your GitHub account first.
```

**السبب:** Vercel يحتاج إلى صلاحيات للوصول إلى مستودع GitHub الخاص بك.

---

## ✅ الحل - خطوة بخطوة

### الخطوة 1: إعادة ربط GitHub مع Vercel

#### 1.1 افتح إعدادات Vercel
```
1. اذهب إلى: https://vercel.com/
2. اضغط على صورة ملفك الشخصي (أعلى يمين)
3. اختر "Settings"
4. من القائمة الجانبية → "Git"
```

#### 1.2 إزالة الاتصال الحالي (إذا موجود)
```
1. في قسم "Connected Git Providers"
2. ابحث عن "GitHub"
3. اضغط "Disconnect" (إذا كان متصل)
4. أكّد الإزالة
```

#### 1.3 إضافة اتصال جديد
```
1. اضغط على "Connect" بجانب GitHub
2. ستُفتح نافذة GitHub
3. سجل دخول إلى GitHub (إذا لم تكن مسجلاً)
4. اضغط "Authorize Vercel"
5. اختر "All repositories" أو اختر المستودعات يدوياً
6. اضغط "Install & Authorize"
```

**مهم:** تأكد من اختيار "All repositories" أو على الأقل اختيار `ainoamn-ain-oman-web`.

---

### الخطوة 2: استيراد المشروع إلى Vercel

#### 2.1 إنشاء مشروع جديد
```
1. من Dashboard الرئيسي في Vercel
2. اضغط "Add New..." → "Project"
3. ستظهر قائمة مستودعات GitHub
```

#### 2.2 البحث عن المستودع
```
1. ابحث عن: ainoamn-ain-oman-web
2. اضغط "Import" بجانب المستودع
```

#### 2.3 إعداد المشروع
```
Project Name: ain-oman-web (أو أي اسم تريده)
Framework Preset: Next.js (سيتم اكتشافه تلقائياً)
Root Directory: ./ (اتركه كما هو)
Build Command: npm run build (اتركه افتراضي)
Output Directory: .next (اتركه افتراضي)
Install Command: npm install (اتركه افتراضي)
```

#### 2.4 متغيرات البيئة (Environment Variables)
```
إذا كان لديك ملف .env.local، أضف المتغيرات:

Name: NEXTAUTH_URL
Value: https://byfpro.com

(أضف أي متغيرات أخرى إذا لزم)
```

#### 2.5 النشر
```
اضغط "Deploy"
انتظر 2-5 دقائق للبناء والنشر
```

---

### الخطوة 3: ربط الدومين المخصص

#### 3.1 بعد نجاح النشر
```
1. اذهب إلى Project Settings
2. من القائمة الجانبية → "Domains"
3. اضغط "Add Domain"
```

#### 3.2 إضافة الدومين
```
1. أدخل: byfpro.com
2. اضغط "Add"
3. ستظهر لك تعليمات DNS
```

#### 3.3 إعداد DNS Records
في لوحة تحكم الدومين الخاص بك (GoDaddy/Namecheap/etc):

**للدومين الرئيسي (byfpro.com):**
```
Type: A
Name: @ (أو اتركه فارغ)
Value: 76.76.21.21 (IP من Vercel)
TTL: 3600 (أو Auto)
```

**للنطاق الفرعي www:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**ملاحظة:** Vercel ستعطيك القيم الدقيقة في صفحة Domains.

#### 3.4 التحقق
```
1. انتظر 5-60 دقيقة (لانتشار DNS)
2. Vercel ستتحقق تلقائياً
3. عند النجاح، ستظهر علامة ✓ بجانب الدومين
```

---

## 🔧 إذا استمرت المشكلة

### الحل البديل 1: استخدام GitHub Personal Access Token

#### 1. إنشاء Token في GitHub
```
1. اذهب إلى: https://github.com/settings/tokens
2. اضغط "Generate new token" → "Generate new token (classic)"
3. اسم الـ Token: Vercel Access
4. اختر Scopes:
   ✓ repo (كل الصلاحيات)
   ✓ admin:repo_hook
5. اضغط "Generate token"
6. انسخ الـ Token (لن يظهر مرة أخرى!)
```

#### 2. إضافة Token في Vercel
```
1. Vercel Settings → Git
2. GitHub → Configure
3. استخدم الـ Token للمصادقة
```

---

### الحل البديل 2: Deploy من CLI

إذا لم تنجح الطرق أعلاه، يمكنك النشر من الـ Terminal مباشرة:

#### 1. تثبيت Vercel CLI
```bash
npm install -g vercel
```

#### 2. تسجيل الدخول
```bash
vercel login
# أدخل بريدك الإلكتروني المسجل في Vercel
```

#### 3. Deploy المشروع
```bash
cd C:\dev\ain-oman-web
vercel

# أجب على الأسئلة:
# Set up and deploy? Y
# Which scope? اختر حسابك
# Link to existing project? N
# Project name? ain-oman-web
# In which directory? ./ (اضغط Enter)
# Overwrite settings? N
```

#### 4. Deploy للإنتاج
```bash
vercel --prod
```

#### 5. إضافة الدومين
```bash
vercel domains add byfpro.com
# اتبع التعليمات لإضافة DNS records
```

---

## 🔍 التحقق من النشر

### بعد نجاح النشر:

#### 1. افتح رابط Vercel المؤقت
```
https://ain-oman-web-xxx.vercel.app
```

#### 2. تحقق من:
- ✅ الصفحة الرئيسية تعمل
- ✅ تسجيل الدخول يعمل
- ✅ الصور تظهر
- ✅ APIs تعمل

#### 3. بعد ربط الدومين:
```
https://byfpro.com
```

---

## ⚙️ إعدادات مهمة

### في Vercel Project Settings:

#### General:
```
Framework: Next.js
Node.js Version: 20.x (أو أحدث)
```

#### Build & Development:
```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
```

#### Environment Variables:
```
NEXTAUTH_URL=https://byfpro.com
NODE_ENV=production

# إذا كان لديك Google Maps API:
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here

# OAuth (إذا كنت تستخدم):
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
# (راجع OAUTH_SETUP_GUIDE.md)
```

---

## 📊 DNS Configuration

### مثال لإعدادات DNS في لوحة التحكم:

```
┌────────┬──────┬───────────────────────┬──────┐
│ Type   │ Name │ Value                 │ TTL  │
├────────┼──────┼───────────────────────┼──────┤
│ A      │ @    │ 76.76.21.21          │ 3600 │
│ CNAME  │ www  │ cname.vercel-dns.com │ 3600 │
└────────┴──────┴───────────────────────┴──────┘
```

**ملاحظة:** القيم الدقيقة ستظهر في Vercel → Domains.

---

## 🚨 مشاكل شائعة وحلولها

### المشكلة 1: "Repository not found"
**الحل:**
- تأكد أن المستودع ليس خاص (Private)
- أو امنح Vercel صلاحيات للمستودعات الخاصة

### المشكلة 2: "Build failed"
**الحل:**
```bash
# تحقق من Build محلياً أولاً:
npm run build

# إذا نجح محلياً، المشكلة قد تكون في:
# - متغيرات البيئة مفقودة
# - Dependencies غير مثبتة
```

### المشكلة 3: "Domain not verified"
**الحل:**
- انتظر 5-60 دقيقة لانتشار DNS
- تحقق من DNS records باستخدام: https://dnschecker.org/
- تأكد من القيم الصحيحة

### المشكلة 4: "APIs not working"
**الحل:**
- تحقق من Environment Variables
- تأكد من NEXTAUTH_URL صحيح
- راجع Logs في Vercel

---

## 📝 Checklist للنشر

قبل النشر، تأكد من:

- [ ] المشروع يعمل محلياً (`npm run build`)
- [ ] لا توجد أخطاء TypeScript
- [ ] لا توجد أخطاء Linter
- [ ] ملف `.gitignore` صحيح
- [ ] Environment variables جاهزة
- [ ] GitHub repository محدّث

بعد النشر، تحقق من:

- [ ] الصفحة الرئيسية تعمل
- [ ] تسجيل الدخول يعمل
- [ ] الصور تظهر
- [ ] APIs تستجيب
- [ ] الدومين المخصص يعمل
- [ ] HTTPS مُفعّل

---

## 🎯 الخطوات المختصرة

### للنشر السريع:

```bash
# 1. تثبيت Vercel CLI
npm install -g vercel

# 2. تسجيل الدخول
vercel login

# 3. Deploy
cd C:\dev\ain-oman-web
vercel --prod

# 4. إضافة الدومين
vercel domains add byfpro.com

# 5. اتبع تعليمات DNS
```

---

## 📞 الدعم

### إذا واجهت مشاكل:

1. **Vercel Docs:** https://vercel.com/docs
2. **Vercel Support:** https://vercel.com/support
3. **Community:** https://github.com/vercel/vercel/discussions

---

## ✅ النتيجة المتوقعة

بعد إتمام الخطوات:

```
✅ المشروع منشور على Vercel
✅ يعمل على: https://byfpro.com
✅ HTTPS مُفعّل تلقائياً
✅ CDN عالمي
✅ Auto-deploy عند Push لـ GitHub
✅ Preview deployments للـ Pull Requests
```

---

*تاريخ الإنشاء: 8 أكتوبر 2025*  
*الدومين المستهدف: https://byfpro.com*  
*الحالة: دليل شامل جاهز للتطبيق*

