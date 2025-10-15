# 🚀 دليل النشر - Deployment Guide

## 📋 ما قبل النشر (Pre-deployment Checklist)

### ✅ التحقق من الجودة
- [ ] جميع الاختبارات تعمل (`npm test`)
- [ ] لا توجد أخطاء Linting (`npm run lint`)
- [ ] Build ناجح (`npm run build`)
- [ ] البيئة مجهزة (Environment variables)
- [ ] قاعدة البيانات جاهزة (إن وجدت)

### 🔐 الأمان
- [ ] تحديث جميع الـ dependencies
- [ ] إزالة console.logs الحساسة
- [ ] فحص الثغرات الأمنية (`npm audit`)
- [ ] تفعيل HTTPS
- [ ] تأمين الـ API endpoints

---

## 🌐 النشر على Vercel (موصى به)

### الطريقة 1: من خلال GitHub (تلقائي)

```bash
# 1. Push المشروع إلى GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. اذهب إلى vercel.com
# 3. ربط حساب GitHub
# 4. استيراد المشروع
# 5. Deploy!
```

### الطريقة 2: Vercel CLI

```bash
# 1. تثبيت Vercel CLI
npm i -g vercel

# 2. تسجيل الدخول
vercel login

# 3. Deploy
vercel

# أو للإنتاج مباشرة
vercel --prod
```

### إعدادات Vercel

#### Build Settings:
```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

#### Environment Variables:
```
NEXT_PUBLIC_API_URL=https://api.ainoman.om
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE=96899999999
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

---

## 🐳 النشر باستخدام Docker

### Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Build & Run

```bash
# Build
docker build -t ain-oman .

# Run
docker run -p 3000:3000 ain-oman

# مع Environment Variables
docker run -p 3000:3000 \
  -e DATABASE_URL="your_db_url" \
  -e JWT_SECRET="your_secret" \
  ain-oman
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=ainoman
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres-data:
```

```bash
# Run
docker-compose up -d
```

---

## ☁️ النشر على AWS

### AWS Amplify

```bash
# 1. Install Amplify CLI
npm install -g @aws-amplify/cli

# 2. Configure
amplify configure

# 3. Initialize
amplify init

# 4. Add hosting
amplify add hosting

# 5. Publish
amplify publish
```

### AWS EC2

```bash
# 1. SSH إلى الـ server
ssh -i your-key.pem ec2-user@your-instance-ip

# 2. تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone المشروع
git clone https://github.com/your-username/ain-oman-web.git
cd ain-oman-web

# 4. Install & Build
npm install
npm run build

# 5. تشغيل بـ PM2
npm install -g pm2
pm2 start npm --name "ain-oman" -- start
pm2 save
pm2 startup
```

---

## 🌩️ النشر على Azure

```bash
# 1. Install Azure CLI
# 2. تسجيل الدخول
az login

# 3. Create App Service
az webapp up --name ain-oman --runtime "NODE|18-lts"

# 4. Configure
az webapp config appsettings set \
  --name ain-oman \
  --settings DATABASE_URL="your_db_url"
```

---

## 📊 CI/CD مع GitHub Actions

### `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🔍 Monitoring & Logging

### Vercel Analytics
```javascript
// pages/_app.tsx
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

### Sentry (Error Tracking)
```bash
npm install --save @sentry/nextjs

# Run wizard
npx @sentry/wizard -i nextjs
```

---

## 📈 Performance Optimization

### 1. Enable Compression
```javascript
// next.config.js
module.exports = {
  compress: true,
};
```

### 2. Image Optimization
```javascript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: ['your-cdn.com'],
  },
};
```

### 3. Bundle Analyzer
```bash
npm install --save-dev @next/bundle-analyzer

# package.json
"analyze": "ANALYZE=true next build"
```

---

## 🌐 Custom Domain

### Vercel
1. اذهب إلى Dashboard → Domains
2. أضف domain الخاص بك
3. أضف DNS records:
```
A     @    76.76.21.21
CNAME www  cname.vercel-dns.com
```

---

## 🔄 Rollback Strategy

### Vercel
```bash
# عرض الـ deployments
vercel ls

# Rollback لـ deployment سابق
vercel rollback <deployment-url>
```

### Docker
```bash
# عرض الـ images
docker images

# استخدام image قديم
docker run -p 3000:3000 ain-oman:v1.2.3
```

---

## ✅ Post-Deployment Checklist

- [ ] الموقع يعمل (https://www.ainoman.om)
- [ ] SSL Certificate نشط
- [ ] جميع الصفحات تحمّل
- [ ] APIs تعمل
- [ ] Database متصلة
- [ ] Images تظهر
- [ ] Forms تعمل
- [ ] Payments تعمل (إن وجدت)
- [ ] Analytics مفعّل
- [ ] Error tracking مفعّل
- [ ] Backups مجدولة

---

**🎉 تهانينا! موقعك الآن على الإنترنت!**

