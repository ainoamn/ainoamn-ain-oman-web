# 🚀 دليل نشر Ain Oman Web على Netlify

## لماذا Netlify؟
- ✅ **بديل ممتاز لـ Vercel** - يدعم Next.js بشكل كامل
- ✅ **100GB Bandwidth مجاناً** - أكثر من كافي لمعظم المشاريع
- ✅ **نشر تلقائي** - يتم النشر تلقائياً عند كل Push لـ GitHub
- ✅ **ربط دومين سهل** - إضافة دومين خلال دقائق
- ✅ **أداء عالي** - CDN عالمي سريع

---

## 📋 خطوات النشر على Netlify:

### **الخطوة 1: التسجيل في Netlify** (دقيقة واحدة)

1. افتح الرابط: https://app.netlify.com/signup
2. اضغط على **"Sign up with GitHub"**
3. سجّل دخول بحساب GitHub الخاص بك
4. امنح Netlify صلاحيات الوصول لـ repositories

---

### **الخطوة 2: رفع المشروع لـ GitHub** (إذا لم يكن مرفوعاً)

```bash
# تأكد أن جميع التغييرات محفوظة
git add .
git commit -m "🚀 جاهز للنشر على Netlify"
git push origin main
```

---

### **الخطوة 3: إنشاء موقع جديد على Netlify**

1. بعد تسجيل الدخول، اضغط على **"Add new site"**
2. اختر **"Import an existing project"**
3. اختر **"Deploy with GitHub"**
4. ابحث عن repository: `ain-oman-web`
5. اضغط على اسم الـ repository

---

### **الخطوة 4: تكوين إعدادات البناء**

Netlify سيكتشف تلقائياً أنه مشروع Next.js، تأكد من:

```
Branch to deploy: main
Build command: npm run build
Publish directory: .next
```

**مهم:** 
- اضغط على **"Show advanced"**
- أضف متغيرات البيئة (Environment Variables):

```
NEXT_PUBLIC_API_URL = https://yourdomain.com/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = (مفتاحك)
NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE = (رقمك)
```

---

### **الخطوة 5: بدء النشر**

1. اضغط على **"Deploy site"** (أزرق كبير)
2. انتظر 5-10 دقائق حتى يكتمل البناء
3. ستحصل على رابط مثل: `https://random-name-12345.netlify.app`

---

### **الخطوة 6: ربط الدومين الخاص بك** 🎯

#### **6.1 إضافة الدومين في Netlify:**

1. في Netlify Dashboard، اضغط على **"Domain settings"**
2. اضغط على **"Add custom domain"**
3. أدخل دومينك: `byfpro.com`
4. اضغط **"Verify"**
5. اضغط **"Add domain"**

#### **6.2 تحديث DNS في مزود الدومين:**

اذهب لمزود الدومين (مثل GoDaddy, Namecheap, Cloudflare) وأضف:

**خيار A: استخدام Nameservers (الأسهل):**
```
dns1.p05.nsone.net
dns2.p05.nsone.net
dns3.p05.nsone.net
dns4.p05.nsone.net
```

**خيار B: استخدام A Record + CNAME:**
```
A Record:
Type: A
Name: @
Value: 75.2.60.5

CNAME Record:
Type: CNAME
Name: www
Value: random-name-12345.netlify.app
```

⏰ **الانتظار:** DNS قد يستغرق من 5 دقائق إلى 48 ساعة للتفعيل (عادة 30 دقيقة)

---

### **الخطوة 7: تفعيل HTTPS** 🔒

1. في Netlify → **"Domain settings"**
2. انتقل لقسم **"HTTPS"**
3. اضغط على **"Verify DNS configuration"**
4. بعد التحقق، اضغط **"Provision certificate"**
5. سيتم تفعيل SSL مجاناً خلال دقائق!

---

## 🔄 النشر التلقائي (Continuous Deployment)

من الآن فصاعداً، كل ما تفعله هو:

```bash
git add .
git commit -m "تحديث جديد"
git push origin main
```

✅ **Netlify سينشر التحديث تلقائياً خلال 5 دقائق!**

---

## 📊 مراقبة الأداء والزيارات

في Netlify Dashboard:
- **Analytics** - إحصائيات الزيارات
- **Deploy notifications** - إشعارات النشر
- **Build logs** - سجلات البناء

---

## 🆘 حل المشاكل الشائعة

### **1. فشل البناء (Build Failed):**
- راجع **Deploy logs** في Netlify
- تأكد أن `npm run build` يعمل محلياً
- تحقق من `netlify.toml` موجود في root

### **2. الصفحة تعرض 404:**
- تأكد أن `Publish directory` هو `.next`
- راجع **Redirects** في `netlify.toml`

### **3. الدومين لا يعمل:**
- تحقق من DNS propagation: https://dnschecker.org/
- انتظر 30-60 دقيقة وجرب مرة أخرى
- تأكد أن DNS settings صحيحة في مزود الدومين

### **4. Environment Variables لا تعمل:**
- تأكد أن المتغيرات تبدأ بـ `NEXT_PUBLIC_` للـ client-side
- أعد النشر (Redeploy) بعد تغيير المتغيرات

---

## 💡 نصائح إضافية

### **تسريع البناء:**
1. في Netlify → **Site settings** → **Build & deploy**
2. فعّل **"Build plugins"**
3. أضف plugin: `@netlify/plugin-nextjs`

### **تفعيل التخزين المؤقت:**
- Netlify يفعّل caching تلقائياً
- CDN عالمي يضمن سرعة عالية في كل مكان

### **Preview Deployments:**
- كل Pull Request يحصل على رابط preview خاص
- اختبر التغييرات قبل دمجها في main

---

## 📞 الدعم الفني

- **Netlify Docs:** https://docs.netlify.com/
- **Community Forum:** https://answers.netlify.com/
- **Discord:** https://discord.gg/netlify
- **Support:** https://www.netlify.com/support/

---

## 🎉 مقارنة: Netlify vs Vercel

| الميزة | Netlify | Vercel |
|--------|---------|--------|
| **Bandwidth مجاناً** | 100GB | 100GB |
| **Build Minutes** | 300 دقيقة | 6,000 دقيقة |
| **دعم Next.js** | ممتاز | ممتاز |
| **السهولة** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **السرعة** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **الاستقرار** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **السعر** | مجاني + مدفوع | مجاني + مدفوع |

---

## ✅ Checklist للنجاح

- [ ] تسجيل حساب Netlify
- [ ] ربط GitHub account
- [ ] رفع كود على GitHub
- [ ] إنشاء site جديد على Netlify
- [ ] إضافة Environment Variables
- [ ] نشر الموقع (Deploy)
- [ ] إضافة custom domain
- [ ] تحديث DNS settings
- [ ] تفعيل HTTPS
- [ ] اختبار الموقع ✅

---

**تاريخ الإنشاء:** 2025-10-22  
**الحالة:** ✅ جاهز للاستخدام  
**الدعم:** متاح 24/7

