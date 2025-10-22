# 🚂 دليل نشر Ain Oman Web على Railway

## لماذا Railway؟
- ✅ **مناسب للمشاريع الكبيرة والمعقدة**
- ✅ **$5 رصيد مجاني شهرياً** (يكفي لمشروع صغير-متوسط)
- ✅ **دعم Database مدمج** (PostgreSQL, MySQL, MongoDB, Redis)
- ✅ **تحكم كامل** - أقرب شيء لـ VPS
- ✅ **دعم Docker** - إذا احتجت تخصيص البيئة

---

## 📋 خطوات النشر على Railway:

### **الخطوة 1: التسجيل** (دقيقة واحدة)

1. افتح: https://railway.app/
2. اضغط **"Login"**
3. اختر **"Login with GitHub"**
4. امنح Railway الصلاحيات

---

### **الخطوة 2: إنشاء Project جديد**

1. من Dashboard، اضغط **"+ New Project"**
2. اختر **"Deploy from GitHub repo"**
3. ابحث عن: `ain-oman-web`
4. اضغط على اسم الـ repository

---

### **الخطوة 3: تكوين إعدادات البناء**

Railway سيكتشف Next.js تلقائياً، ولكن تأكد من:

1. اضغط على الـ service (deployment)
2. اذهب لـ **"Settings"**
3. في **"Build"**:
   ```
   Build Command: npm run build
   Start Command: npm start
   ```

4. في **"Environment"**:
   ```
   Node Version: 18
   ```

---

### **الخطوة 4: إضافة Environment Variables**

1. في الـ service، اختر **"Variables"**
2. أضف المتغيرات:

```
NODE_ENV = production
NEXT_PUBLIC_API_URL = https://yourdomain.com/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = (مفتاحك)
NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE = (رقمك)
PORT = 3000
```

---

### **الخطوة 5: بدء النشر**

1. Railway سيبدأ البناء تلقائياً
2. انتظر 5-10 دقائق
3. ستحصل على رابط: `https://ain-oman-web-production.up.railway.app`

---

### **الخطوة 6: ربط الدومين الخاص** 🎯

1. في الـ service، اذهب لـ **"Settings"**
2. اضغط **"Domains"**
3. اضغط **"+ Custom Domain"**
4. أدخل: `byfpro.com`
5. ستحصل على CNAME record

#### **تحديث DNS:**

اذهب لمزود الدومين وأضف:

```
Type: CNAME
Name: @ (أو www)
Value: (القيمة التي أعطاك إياها Railway)
TTL: Auto
```

⏰ انتظر 5-30 دقيقة للتفعيل

---

### **الخطوة 7: تفعيل HTTPS** 🔒

Railway يفعّل HTTPS تلقائياً! ✅

---

## 💰 التسعير

### **الخطة المجانية (Hobby):**
- ✅ **$5 رصيد مجاني شهرياً**
- ✅ **500GB Bandwidth**
- ✅ **Unlimited projects**
- ✅ **8GB RAM / 8 vCPU**

**ملاحظة:** إذا انتهى الرصيد، الموقع سيتوقف حتى الشهر التالي!

### **الخطة المدفوعة (Pro):**
- 💰 **$20/شهر** (+ استخدام حسب الطلب)
- ✅ **غير محدود**
- ✅ **Priority support**
- ✅ **Custom metrics**

---

## 🔄 النشر التلقائي

كل push لـ GitHub سيؤدي لنشر تلقائي:

```bash
git add .
git commit -m "تحديث"
git push origin main
```

✅ Railway ينشر خلال 3-5 دقائق!

---

## 🗄️ إضافة Database (اختياري)

إذا احتجت database:

1. في Project، اضغط **"+ New"**
2. اختر **"Database"**
3. اختر النوع:
   - **PostgreSQL** (الأشهر)
   - **MySQL**
   - **MongoDB**
   - **Redis** (للـ caching)

4. Railway سيوفر لك connection string تلقائياً

---

## 📊 المميزات الإضافية

### **1. Metrics و Logs:**
- استهلاك CPU و RAM
- Network traffic
- Response times
- Real-time logs

### **2. Deployments History:**
- كل deployment محفوظ
- Rollback سهل
- Environment variables per deployment

### **3. CLI Tool:**
```bash
# تثبيت Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy مباشرة
railway up
```

---

## 🆘 حل المشاكل

### **الموقع توقف بعد فترة:**
- تحقق من الرصيد: Dashboard → **"Usage"**
- إذا انتهى، انتظر أول الشهر التالي
- أو اشترك في Pro plan

### **فشل البناء:**
```bash
# راجع الـ logs
# في Railway Dashboard → Service → "Deployments" → "View Logs"
```

### **الدومين لا يعمل:**
1. تحقق من CNAME في DNS: https://dnschecker.org/
2. تأكد من إضافة CNAME صحيح
3. انتظر 30 دقيقة

---

## 🎯 متى تختار Railway؟

✅ **اختر Railway إذا:**
- تحتاج database مدمج
- مشروعك يحتاج موارد كثيرة (RAM, CPU)
- تريد تحكم كامل في البيئة
- تحتاج background jobs
- ميزانيتك تسمح ($20/شهر)

❌ **لا تختر Railway إذا:**
- تريد حل مجاني 100%
- مشروعك بسيط ولا يحتاج resources كثيرة
- تريد bandwidth غير محدود

---

## 📞 الدعم

- **Docs:** https://docs.railway.app/
- **Discord:** https://discord.gg/railway
- **Twitter:** @Railway

---

## ✅ Checklist

- [ ] تسجيل حساب Railway
- [ ] إنشاء project جديد
- [ ] ربط GitHub repository
- [ ] تكوين Environment Variables
- [ ] Deploy أول مرة
- [ ] ربط custom domain
- [ ] تحديث DNS
- [ ] اختبار الموقع ✅
- [ ] مراقبة الرصيد شهرياً

---

**تاريخ:** 2025-10-22  
**التوصية:** ⭐⭐⭐⭐ ممتاز للمشاريع المتقدمة

