# 🏠 عين عُمان - Ain Oman

> منصة عقارية متقدمة مبنية بأحدث التقنيات

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ✨ الميزات الرئيسية

### 🏢 إدارة العقارات
- ✅ **Unified Management** - لوحة تحكم موحدة وذكية
- ✅ **Bulk Actions** - عمليات متعددة (نشر/إخفاء/حذف/تصدير)
- ✅ **Advanced Filters** - فلاتر متقدمة وبحث ذكي
- ✅ **Real-time Sync** - مزامنة فورية عبر التابات

### 🤖 ذكاء اصطناعي
- ✅ **AI Insights** - توصيات ذكية مخصصة
- ✅ **Smart Analytics** - تحليلات متقدمة
- ✅ **Predictive Reports** - تقارير تنبؤية

### 📊 البيانات والتقارير
- ✅ **Interactive Charts** - رسوم بيانية تفاعلية (Recharts)
- ✅ **Real-time Stats** - إحصائيات حقيقية
- ✅ **Export Features** - تصدير (PDF, Excel, CSV)
- ✅ **Advanced Reports** - تقارير شاملة

### 🔔 الإشعارات والمهام
- ✅ **Real-time Notifications** - إشعارات فورية
- ✅ **Task Management** - إدارة مهام متكاملة
- ✅ **BroadcastChannel Sync** - تزامن عبر التابات

### 💬 التواصل
- ✅ **WhatsApp Integration** - تكامل WhatsApp كامل
- ✅ **Reviews System** - نظام تقييمات وتعليقات
- ✅ **Chat Widget** - دردشة مباشرة

### 🗺️ الخرائط
- ✅ **Advanced Maps** - خرائط تفاعلية متقدمة
- ✅ **Property Markers** - علامات للعقارات
- ✅ **Map Types** - roadmap/satellite/hybrid

### 🎨 التصميم
- ✅ **Dark Mode** - وضع ليلي كامل
- ✅ **Responsive Design** - متجاوب 100%
- ✅ **RTL Support** - دعم اللغة العربية
- ✅ **Modern Animations** - حركات سلسة

### ⚡ الأداء
- ✅ **Lazy Loading** - تحميل ذكي
- ✅ **Code Splitting** - تقسيم الكود
- ✅ **Image Optimization** - تحسين الصور
- ✅ **PWA Ready** - جاهز كتطبيق ويب تقدمي

---

## 🚀 التثبيت والتشغيل

### المتطلبات
- Node.js 18+ 
- npm أو yarn

### الخطوات

```bash
# 1. Clone المشروع
git clone https://github.com/your-username/ain-oman-web.git

# 2. الدخول للمجلد
cd ain-oman-web

# 3. تثبيت الـ dependencies
npm install

# 4. تشغيل الـ Development Server
npm run dev

# 5. افتح المتصفح
http://localhost:3000
```

---

## 📁 هيكل المشروع

```
ain-oman-web/
├── src/
│   ├── pages/           # الصفحات
│   │   ├── api/         # API Routes
│   │   ├── properties/  # صفحات العقارات
│   │   ├── profile/     # البروفايل
│   │   ├── tasks.tsx    # المهام
│   │   ├── reports.tsx  # التقارير
│   │   └── notifications.tsx
│   ├── components/      # المكونات
│   │   ├── layout/      # Layout Components
│   │   ├── PropertyReviews.tsx
│   │   ├── WhatsAppButton.tsx
│   │   ├── AdvancedMap.tsx
│   │   └── ThemeToggle.tsx
│   ├── context/         # React Contexts
│   │   ├── ThemeContext.tsx
│   │   ├── NotificationsContext.tsx
│   │   └── AuthContext.tsx
│   ├── lib/             # المكتبات
│   │   ├── whatsapp.ts
│   │   ├── export.ts
│   │   └── animations.ts
│   └── styles/          # الأنماط
├── .data/               # بيانات JSON
│   ├── properties.json
│   ├── reviews.json
│   ├── notifications.json
│   └── tasks.json
├── public/              # ملفات عامة
└── docs/                # التوثيق
```

---

## 🔑 الميزات التقنية

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** React Context + Hooks
- **Charts:** Recharts
- **Icons:** React Icons
- **Maps:** Google Maps API

### Backend
- **API:** Next.js API Routes
- **Storage:** JSON Files (.data/)
- **Auth:** localStorage (للتطوير)

### Performance
- **Code Splitting:** Automatic
- **Lazy Loading:** Dynamic Imports
- **Image Optimization:** Next/Image
- **Caching:** SWR / React Query

### Real-time Features
- **BroadcastChannel API** - للتزامن عبر التابات
- **CustomEvent** - للتزامن داخل نفس التاب
- **LocalStorage Events** - للتحديثات

---

## 📚 التوثيق

- 📖 [دليل الاستخدام](USER_GUIDE.md)
- 🧪 [دليل الاختبار](TESTING_GUIDE.md)
- 📚 [توثيق APIs](API_DOCUMENTATION.md)
- 🏗️ [هندسة النظام](SYSTEM_ARCHITECTURE.md)

---

## 🧪 الاختبار

```bash
# Run development server
npm run dev

# Build للإنتاج
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 🚀 النشر

### Vercel (موصى به)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker
```bash
# Build
docker build -t ain-oman .

# Run
docker run -p 3000:3000 ain-oman
```

---

## 🔐 الأمان

⚠️ **ملاحظة مهمة:** النظام الحالي للتطوير فقط

**للإنتاج:**
- [ ] استخدم JWT بدلاً من localStorage
- [ ] أضف rate limiting
- [ ] فعّل HTTPS
- [ ] استخدم قاعدة بيانات حقيقية
- [ ] أضف CSRF protection
- [ ] فعّل CORS
- [ ] Validate جميع الـ inputs

---

## 🤝 المساهمة

نرحب بالمساهمات! 

```bash
# 1. Fork المشروع
# 2. أنشئ branch جديد
git checkout -b feature/amazing-feature

# 3. Commit التغييرات
git commit -m 'Add amazing feature'

# 4. Push
git push origin feature/amazing-feature

# 5. افتح Pull Request
```

---

## 📝 الترخيص

MIT License - انظر [LICENSE](LICENSE) للتفاصيل

---

## 👥 الفريق

- **المطور الرئيسي:** [اسمك]
- **AI Partner:** Claude Sonnet 4.5
- **التصميم:** Tailwind CSS

---

## 📞 التواصل

- 🌐 Website: [www.ainoman.om](https://www.ainoman.om)
- 📧 Email: info@ainoman.om
- 💬 WhatsApp: +968 9999 9999
- 🐙 GitHub: [github.com/your-username/ain-oman-web](https://github.com/your-username/ain-oman-web)

---

## 🎯 خريطة الطريق

### ✅ المكتمل
- [x] إدارة العقارات المتقدمة
- [x] Bulk Actions
- [x] AI Insights
- [x] نظام الإشعارات والمهام
- [x] تكامل WhatsApp
- [x] نظام التقييمات
- [x] الخرائط التفاعلية
- [x] Dark Mode
- [x] Performance Optimization

### 🔄 قيد العمل
- [ ] Mobile App (React Native)
- [ ] Advanced Analytics
- [ ] Payment Gateway
- [ ] Email Notifications

### 📅 المخطط
- [ ] Blockchain Integration
- [ ] VR Property Tours
- [ ] AI Chatbot
- [ ] Multi-language Support

---

<div align="center">

**صُنع بـ ❤️ في عُمان**

⭐ إذا أعجبك المشروع، لا تنسَ النجمة!

</div>
