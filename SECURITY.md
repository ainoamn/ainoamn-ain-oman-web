# 🔒 دليل الأمان - Security Guide

## ⚠️ تحذير مهم

**النظام الحالي للتطوير فقط!** 

للاستخدام في الإنتاج، يجب تطبيق التحسينات التالية:

---

## 🛡️ الأمان الحالي (Development)

### ✅ ما هو موجود:
- localStorage للمصادقة
- JSON Files للبيانات
- Basic validation

### ❌ ما هو مفقود:
- قاعدة بيانات حقيقية
- JWT tokens
- Password hashing
- CSRF protection
- Rate limiting
- HTTPS enforcement

---

## 🔐 تحسينات الأمان للإنتاج

### 1. المصادقة (Authentication)

#### حالياً:
```javascript
// ⚠️ غير آمن - للتطوير فقط
localStorage.setItem('ain_auth', JSON.stringify(user));
```

#### للإنتاج:
```javascript
// ✅ استخدم JWT
import jwt from 'jsonwebtoken';

const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
  expiresIn: '7d'
});

// HttpOnly Cookie
res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Secure; SameSite=Strict`);
```

### 2. كلمات المرور

#### للإنتاج:
```javascript
// ✅ استخدم bcrypt
import bcrypt from 'bcryptjs';

// Hash
const hashedPassword = await bcrypt.hash(password, 10);

// Verify
const isValid = await bcrypt.compare(password, hashedPassword);
```

### 3. قاعدة البيانات

#### حالياً:
```javascript
// ⚠️ JSON Files - للتطوير فقط
const data = JSON.parse(fs.readFileSync('data.json'));
```

#### للإنتاج:
```javascript
// ✅ استخدم Prisma + PostgreSQL
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const properties = await prisma.property.findMany();
```

### 4. Input Validation

```javascript
// ✅ استخدم Zod أو Yup
import { z } from 'zod';

const propertySchema = z.object({
  title: z.string().min(3).max(200),
  price: z.number().positive(),
  email: z.string().email(),
});

const validated = propertySchema.parse(input);
```

### 5. Rate Limiting

```javascript
// ✅ منع Brute Force
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 6. CSRF Protection

```javascript
// ✅ CSRF Tokens
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);
```

### 7. XSS Protection

```javascript
// ✅ Sanitize HTML
import DOMPurify from 'isomorphic-dompurify';

const clean = DOMPurify.sanitize(dirtyHTML);
```

### 8. SQL Injection Protection

```javascript
// ✅ استخدم Prepared Statements
// Prisma يحميك تلقائياً

// ❌ لا تفعل هذا أبداً:
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ استخدم:
const user = await prisma.user.findUnique({ where: { id: userId } });
```

### 9. HTTPS

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ]
  }
}
```

### 10. Environment Variables

```bash
# .env.local
# ✅ لا تنشرها أبداً في Git

DATABASE_URL="postgresql://..."
JWT_SECRET="your-super-secret-key-change-this"
NEXT_PUBLIC_API_URL="https://api.ainoman.om"
```

---

## 📋 Checklist للإنتاج

### Authentication & Authorization
- [ ] استبدل localStorage بـ JWT
- [ ] أضف password hashing (bcrypt)
- [ ] نفّذ refresh tokens
- [ ] أضف 2FA (optional)
- [ ] أضف password reset
- [ ] أضف email verification

### Database
- [ ] استخدم PostgreSQL/MySQL
- [ ] استخدم Prisma ORM
- [ ] نفّذ database migrations
- [ ] أضف database backups
- [ ] استخدم connection pooling

### API Security
- [ ] أضف rate limiting
- [ ] نفّذ CORS properly
- [ ] أضف request validation
- [ ] استخدم HTTPS only
- [ ] أضف API versioning
- [ ] نفّذ error handling

### Frontend Security
- [ ] Sanitize user inputs
- [ ] نفّذ CSP (Content Security Policy)
- [ ] أضف CSRF protection
- [ ] استخدم HttpOnly cookies
- [ ] نفّذ XSS protection

### Infrastructure
- [ ] استخدم HTTPS
- [ ] نفّذ WAF (Web Application Firewall)
- [ ] أضف DDoS protection
- [ ] استخدم CDN
- [ ] نفّذ monitoring & logging

### Compliance
- [ ] GDPR compliance (EU)
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Cookie consent
- [ ] Data retention policy

---

## 🚨 الإبلاغ عن الثغرات

إذا وجدت ثغرة أمنية:

1. **لا تنشرها علناً**
2. أرسل email إلى: security@ainoman.om
3. قدم تفاصيل:
   - وصف الثغرة
   - خطوات إعادة الإنتاج
   - التأثير المحتمل
   - اقتراحات للإصلاح

---

## 📚 مصادر مفيدة

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/going-to-production#security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**تذكر:** الأمان ليس ميزة - إنه ضرورة! 🔒

