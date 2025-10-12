# 🚀 أوامر النشر على Vercel

## الخطوات بالترتيب:

### 1️⃣ تسجيل الدخول
```bash
vercel login
```
- اختر طريقة تسجيل الدخول
- أكّد من بريدك الإلكتروني

---

### 2️⃣ Deploy المشروع (أول مرة)
```bash
vercel
```

**الأسئلة التي ستُطرح عليك:**

```
? Set up and deploy "C:\dev\ain-oman-web"? [Y/n] 
→ اكتب: Y

? Which scope do you want to deploy to? 
→ اختر حسابك (استخدم الأسهم + Enter)

? Link to existing project? [y/N] 
→ اكتب: N

? What's your project's name? 
→ اكتب: ain-oman-web

? In which directory is your code located? 
→ اضغط Enter (./‎)

? Want to override the settings? [y/N] 
→ اكتب: N
```

ستبدأ عملية البناء والنشر (2-5 دقائق)

---

### 3️⃣ Deploy للإنتاج (Production)
```bash
vercel --prod
```

بعد نجاح الأمر، ستحصل على:
```
✅ Production: https://ain-oman-web.vercel.app [نسخة مؤقتة]
```

---

### 4️⃣ إضافة الدومين المخصص
```bash
vercel domains add byfpro.com
```

**ستظهر لك تعليمات DNS:**
```
DNS Configuration:
  A      @     76.76.21.21
  CNAME  www   cname.vercel-dns.com
```

---

### 5️⃣ إعداد DNS في لوحة تحكم الدومين

اذهب إلى لوحة تحكم دومينك (GoDaddy/Namecheap/etc) وأضف:

#### Record 1:
```
Type: A
Name: @ (أو اتركه فارغ)
Value: 76.76.21.21 (أو القيمة التي أعطاك Vercel)
TTL: 3600
```

#### Record 2:
```
Type: CNAME  
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

---

### 6️⃣ التحقق من الدومين
```bash
vercel domains inspect byfpro.com
```

انتظر 5-60 دقيقة حتى ينتشر DNS عالمياً.

---

## 🔄 أوامر مفيدة أخرى

### عرض قائمة المشاريع:
```bash
vercel list
```

### عرض معلومات المشروع:
```bash
vercel inspect
```

### عرض الدومينات:
```bash
vercel domains ls
```

### إزالة دومين:
```bash
vercel domains rm byfpro.com
```

### عرض Environment Variables:
```bash
vercel env ls
```

### إضافة Environment Variable:
```bash
vercel env add NEXTAUTH_URL production
# ثم أدخل القيمة: https://byfpro.com
```

### Rollback لنشر سابق:
```bash
vercel rollback
```

### فتح Dashboard:
```bash
vercel open
```

---

## 🎯 سير العمل الكامل

```bash
# 1. تسجيل الدخول (مرة واحدة فقط)
vercel login

# 2. النشر للإنتاج
vercel --prod

# 3. إضافة الدومين
vercel domains add byfpro.com

# 4. تعديل DNS في لوحة تحكم الدومين
# (اتبع التعليمات التي ستظهر)

# 5. التحقق
vercel domains inspect byfpro.com

# ✅ جاهز! افتح: https://byfpro.com
```

---

## 🔄 التحديثات المستقبلية

بعد الربط الأولي، كل ما تحتاجه للتحديثات:

### الطريقة 1: Auto-Deploy من GitHub
```bash
git add .
git commit -m "تحديث الموقع"
git push
```
Vercel ستنشر تلقائياً! ✅

### الطريقة 2: Deploy يدوياً
```bash
vercel --prod
```

---

## ⚠️ ملاحظات مهمة

1. **Environment Variables:**
   - أضف جميع المتغيرات الموجودة في `.env.local`
   - استخدم: `vercel env add` لكل متغير

2. **Build Errors:**
   - تحقق من build محلياً أولاً: `npm run build`
   - راجع logs في: `vercel logs`

3. **DNS Propagation:**
   - قد يستغرق DNS من 5 دقائق إلى ساعة
   - تحقق من: https://dnschecker.org/

4. **HTTPS:**
   - Vercel توفر HTTPS تلقائياً
   - لا حاجة لـ SSL certificates يدوياً

---

## 📞 مساعدة إضافية

- **Vercel Docs:** https://vercel.com/docs/cli
- **دليل كامل:** راجع `VERCEL_DEPLOYMENT_GUIDE.md`

---

*الدومين المستهدف: https://byfpro.com*  
*تاريخ: 8 أكتوبر 2025*

