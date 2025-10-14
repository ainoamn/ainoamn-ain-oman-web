# 🧪 **دليل اختبار التزامن الفوري**

---

## 🎯 **الهدف:**
اختبار أن إضافة/حذف الصلاحيات في `/admin/roles-permissions` ينعكس فوراً في `/profile`

---

## ⚡ **الاختبار السريع (دقيقتين):**

### التحضير:

#### 1️⃣ **افتح تبويب Profile (Owner):**
```
1. افتح المتصفح (Chrome/Firefox/Edge)
2. اذهب إلى: http://localhost:3000/login
3. سجّل دخول:
   البريد: owner@ainoman.om
   كلمة المرور: Owner@2025
4. اذهب إلى: http://localhost:3000/profile
5. اضغط F12 (افتح Developer Tools)
6. اذهب إلى تبويب Console
7. سترى:
   👂 Profile: BroadcastChannel connected
   👂 Profile: Listening for permission changes...
   ✅ Profile: User data updated with 11 permissions
```

#### 2️⃣ **افتح تبويب Roles (Admin) - تبويب جديد:**
```
1. اضغط Ctrl+T (تبويب جديد)
2. اذهب إلى: http://localhost:3000/login
3. سجّل دخول:
   البريد: admin@ainoman.om
   كلمة المرور: Admin@2025
4. اذهب إلى: http://localhost:3000/admin/roles-permissions
5. اضغط F12 (افتح Console)
```

---

### 🧪 **الاختبار 1: إضافة صلاحية**

#### في تبويب Admin (roles-permissions):
```
1. ابحث عن "مالك عقار" في القائمة
2. اضغط "تعديل الصلاحيات"
3. في قسم "القانونية" ابحث عن:
   ☐ view_legal - عرض القانونية
4. ضع علامة ✅
5. اضغط "حفظ وتطبيق على جميع المستخدمين"
6. في Console سترى:
   ✅ Broadcast message sent for real-time sync
```

#### في تبويب Owner (profile):
```
1. ارجع للتبويب الأول (Profile)
2. انظر في Console، سترى:
   📡 Profile: Broadcast message received: {type: "PERMISSIONS_UPDATED", ...}
   🔄 Profile: Permissions updated, reloading...
   🔄 Profile: Loaded permissions from roles config: 12 permissions
   ✅ Profile: User data updated with 12 permissions

3. انظر في الصفحة:
   ✅ ستجد قسم جديد اسمه "القانونية" ظهر!
   ✅ داخله صلاحية "عرض القانونية"
   ✅ بدون إعادة تحميل الصفحة!
```

---

### 🧪 **الاختبار 2: حذف صلاحية**

#### في تبويب Admin (roles-permissions):
```
1. اختر "مالك عقار"
2. أزل علامة ✅ من "view_legal"
3. اضغط "حفظ وتطبيق"
4. في Console سترى:
   ✅ Broadcast message sent for real-time sync
```

#### في تبويب Owner (profile):
```
1. انظر في Console:
   📡 Profile: Broadcast message received
   🔄 Profile: Permissions updated, reloading...
   ✅ Profile: User data updated with 11 permissions

2. انظر في الصفحة:
   ✅ قسم "القانونية" اختفى تلقائياً!
   ✅ بدون F5!
```

---

### 🧪 **الاختبار 3: إضافة عدة صلاحيات**

#### في تبويب Admin:
```
1. اختر "مالك عقار"
2. أضف:
   ✅ view_legal
   ✅ manage_users
   ✅ view_analytics
3. احفظ
```

#### في تبويب Owner:
```
✅ جميع الصلاحيات الـ3 ستظهر فوراً!
✅ سترى 3 أقسام جديدة:
   - القانونية
   - الإدارة (manage_users)
   - أخرى (view_analytics)
```

---

### 🧪 **الاختبار 4: حذف كل الصلاحيات**

#### في تبويب Admin:
```
1. اختر "مالك عقار"
2. أزل جميع الصلاحيات
3. احفظ
```

#### في تبويب Owner:
```
✅ جميع الأقسام ستختفي!
✅ سترى رسالة: "لا توجد صلاحيات مفعّلة"
```

---

## 🔍 **ماذا تبحث عنه:**

### ✅ **علامات النجاح:**

#### في Console (Profile):
```
✅ "BroadcastChannel connected"
✅ "Broadcast message received"
✅ "Permissions updated, reloading"
✅ عدد الصلاحيات يتغير
```

#### في الصفحة (Profile):
```
✅ الأقسام تظهر/تختفي فوراً
✅ الصلاحيات تُضاف/تُحذف فوراً
✅ العداد يتحدث (عدد الصلاحيات)
✅ بدون F5 أو Reload
```

---

## 🐛 **إذا لم يعمل:**

### المشكلة 1: لا ترى "BroadcastChannel connected"
```
الحل: متصفحك قديم
→ استخدم Chrome/Firefox/Edge الحديث
→ أو سيستخدم النظام CustomEvent كبديل
```

### المشكلة 2: لا ترى "Broadcast message received"
```
التحقق:
1. هل أنت في تبويبين مختلفين؟ ✅
2. هل التبويبان في نفس المتصفح؟ ✅
3. هل فتحت Console في كلا التبويبين؟ ✅
4. هل ضغطت "حفظ وتطبيق"؟ ✅
```

### المشكلة 3: الرسالة تصل لكن لا يتحدث
```
التحقق:
1. في Console اكتب:
   JSON.parse(localStorage.getItem('roles_permissions_config'))
2. تأكد من وجود الدور المُعدّل
3. تأكد من تطابق role.id مع user.role
```

---

## 📊 **الإحصائيات المتوقعة:**

| السيناريو | الوقت | النجاح |
|-----------|-------|--------|
| إضافة صلاحية واحدة | < 100ms | ✅ |
| إضافة 5 صلاحيات | < 200ms | ✅ |
| حذف صلاحية | < 100ms | ✅ |
| حذف جميع الصلاحيات | < 200ms | ✅ |

---

## 🎯 **النتيجة النهائية:**

### ✅ يعمل في:
- نفس التبويب
- تبويبات مختلفة
- نفس النافذة
- نوافذ مختلفة (في نفس المتصفح)

### ⚡ السرعة:
- أقل من 100ms في المتوسط
- فوري للمستخدم

### 🎨 التجربة:
- سلسة وسريعة
- بدون تأخير
- بدون إعادة تحميل
- احترافية 100%

---

**🚀 ابدأ الاختبار الآن! 🧪**

*14 أكتوبر 2025*

