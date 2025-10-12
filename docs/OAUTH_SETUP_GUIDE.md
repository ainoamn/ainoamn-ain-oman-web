# 🔐 دليل إعداد OAuth للإنتاج

## 📋 نظرة عامة

تم تطبيق نظام OAuth تجريبي يحاكي العملية الحقيقية. هذا الدليل يشرح كيفية ربط المنصات الحقيقية.

---

## ✨ كيف يعمل النظام الحالي (التطوير)

### المسار التجريبي:
```
1. المستخدم يضغط على زر (مثلاً: Google)
   ↓
2. التوجيه إلى: /api/auth/oauth/google/authorize
   ↓
3. لأنه Demo، يتم التوجيه مباشرة إلى: /api/auth/oauth/google/callback
   ↓
4. إنشاء بيانات مستخدم تجريبية
   ↓
5. التوجيه إلى: /auth/oauth-success
   ↓
6. حفظ البيانات في localStorage
   ↓
7. التوجيه إلى: /dashboard (أو /auth/verify إذا لم يكن موثق)
```

---

## 🚀 للإنتاج: إعداد OAuth الحقيقي

### 1️⃣ Google OAuth

#### الخطوة 1: إنشاء مشروع في Google Cloud
```
1. اذهب إلى: https://console.cloud.google.com/
2. أنشئ مشروع جديد أو اختر موجود
3. فعّل Google+ API
4. اذهب إلى "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
```

#### الخطوة 2: إعداد OAuth consent screen
```
- Application name: Ain Oman
- User support email: support@ainoman.om
- Developer contact: dev@ainoman.om
- Scopes: email, profile, openid
```

#### الخطوة 3: إنشاء OAuth Client ID
```
- Application type: Web application
- Name: Ain Oman Web
- Authorized JavaScript origins:
  * http://localhost:3000 (للتطوير)
  * https://ainoman.om (للإنتاج)
- Authorized redirect URIs:
  * http://localhost:3000/api/auth/oauth/google/callback
  * https://ainoman.om/api/auth/oauth/google/callback
```

#### الخطوة 4: إضافة المفاتيح في `.env.local`
```bash
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

---

### 2️⃣ Facebook OAuth

#### الخطوة 1: إنشاء تطبيق
```
1. اذهب إلى: https://developers.facebook.com/
2. "My Apps" → "Create App"
3. اختر "Consumer" use case
4. اسم التطبيق: Ain Oman
```

#### الخطوة 2: إعداد Facebook Login
```
1. من Dashboard → Add Product → Facebook Login
2. Settings → Valid OAuth Redirect URIs:
   * http://localhost:3000/api/auth/oauth/facebook/callback
   * https://ainoman.om/api/auth/oauth/facebook/callback
```

#### الخطوة 3: الحصول على المفاتيح
```
Settings → Basic:
- App ID: نسخ
- App Secret: نسخ (اضغط Show)
```

#### الخطوة 4: إضافة في `.env.local`
```bash
FACEBOOK_CLIENT_ID=your_app_id_here
FACEBOOK_CLIENT_SECRET=your_app_secret_here
```

---

### 3️⃣ Twitter OAuth 2.0

#### الخطوة 1: إنشاء تطبيق
```
1. اذهب إلى: https://developer.twitter.com/
2. Developer Portal → Projects & Apps → Create App
3. اسم التطبيق: Ain Oman
```

#### الخطوة 2: تفعيل OAuth 2.0
```
1. App Settings → User authentication settings → Set up
2. App permissions: Read
3. Type of App: Web App
4. Callback URI:
   * http://localhost:3000/api/auth/oauth/twitter/callback
   * https://ainoman.om/api/auth/oauth/twitter/callback
5. Website URL: https://ainoman.om
```

#### الخطوة 3: الحصول على المفاتيح
```
Keys and tokens:
- Client ID: نسخ
- Client Secret: نسخ
```

#### الخطوة 4: إضافة في `.env.local`
```bash
TWITTER_CLIENT_ID=your_client_id_here
TWITTER_CLIENT_SECRET=your_client_secret_here
```

---

### 4️⃣ LinkedIn OAuth

#### الخطوة 1: إنشاء تطبيق
```
1. اذهب إلى: https://www.linkedin.com/developers/
2. Create app
3. App name: Ain Oman
4. LinkedIn Page: (أنشئ صفحة للشركة أولاً)
```

#### الخطوة 2: إعداد OAuth
```
1. Auth → OAuth 2.0 settings
2. Redirect URLs:
   * http://localhost:3000/api/auth/oauth/linkedin/callback
   * https://ainoman.om/api/auth/oauth/linkedin/callback
3. OAuth 2.0 scopes:
   * r_liteprofile (للحصول على الملف الشخصي)
   * r_emailaddress (للحصول على البريد)
```

#### الخطوة 3: الحصول على المفاتيح
```
Auth → Application credentials:
- Client ID: نسخ
- Client Secret: نسخ
```

#### الخطوة 4: إضافة في `.env.local`
```bash
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
```

---

### 5️⃣ Apple Sign In

#### الخطوة 1: إعداد Apple Developer Account
```
1. اذهب إلى: https://developer.apple.com/
2. Certificates, Identifiers & Profiles
3. Identifiers → Create a Services ID
```

#### الخطوة 2: إنشاء Services ID
```
1. Description: Ain Oman
2. Identifier: om.ainoman.signin
3. Enable "Sign in with Apple"
4. Configure → Domains and Subdomains:
   * ainoman.om
5. Return URLs:
   * https://ainoman.om/api/auth/oauth/apple/callback
```

#### الخطوة 3: إنشاء Key
```
1. Keys → Create a Key
2. Enable "Sign in with Apple"
3. Download the .p8 key file
```

#### الخطوة 4: إضافة في `.env.local`
```bash
APPLE_CLIENT_ID=om.ainoman.signin
APPLE_TEAM_ID=your_team_id_here
APPLE_KEY_ID=your_key_id_here
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

---

## 🔧 تحديث الكود للإنتاج

### ملف `.env.local` الكامل:
```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret

# Twitter OAuth
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Apple Sign In
APPLE_CLIENT_ID=om.ainoman.signin
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY="your_private_key_content"

# Base URL
NEXTAUTH_URL=http://localhost:3000  # للتطوير
# NEXTAUTH_URL=https://ainoman.om   # للإنتاج
```

---

## 📝 تحديثات مطلوبة في الكود

### في `src/pages/api/auth/oauth/[provider]/callback.ts`:

#### استبدل دالة `fetchUserFromProvider`:
```typescript
async function fetchUserFromProvider(provider: string, code: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`];
  const clientSecret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`];

  // 1. تبادل الكود بـ access token
  const tokenResponse = await fetch(tokenUrls[provider], {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${baseUrl}/api/auth/oauth/${provider}/callback`,
      grant_type: 'authorization_code'
    })
  });
  
  const { access_token } = await tokenResponse.json();
  
  // 2. جلب بيانات المستخدم
  const userResponse = await fetch(userInfoUrls[provider], {
    headers: { 'Authorization': `Bearer ${access_token}` }
  });
  
  return await userResponse.json();
}
```

---

## 🧪 الاختبار الحالي (Demo Mode)

### جرب الآن:
```
http://localhost:3000/login
```

### الخطوات:
1. اضغط على تبويب "وسائل التواصل"
2. اختر أي منصة (Google, Facebook, إلخ)
3. سيتم التوجيه تلقائياً خلال OAuth flow
4. شاهد صفحة "جاري تسجيل الدخول..."
5. سيتم تسجيل دخولك تلقائياً
6. سيتم توجيهك إلى `/auth/verify` أو `/dashboard`

### في Console:
ستجد رسائل مثل:
```
OAuth callback for google: {
  id: "google_1234567890",
  email: "user@gmail.com",
  name: "Google User",
  ...
}
```

---

## 🎯 المميزات الحالية

### ✅ في Demo Mode:
- محاكاة OAuth flow الكاملة
- إنشاء بيانات مستخدم تجريبية
- تحديد نوع الحساب تلقائياً
- صفحة انتقالية جميلة
- معالجة الأخطاء
- حفظ في localStorage

### ⏳ للإنتاج (يتطلب):
- إعداد OAuth apps في كل منصة
- الحصول على Client IDs & Secrets
- إضافة المفاتيح في `.env.local`
- تحديث الكود لاستخدام APIs الحقيقية
- اختبار شامل

---

## 📚 مصادر مفيدة

### التوثيق الرسمي:
- **Google:** https://developers.google.com/identity/protocols/oauth2
- **Facebook:** https://developers.facebook.com/docs/facebook-login/
- **Twitter:** https://developer.twitter.com/en/docs/authentication/oauth-2-0
- **LinkedIn:** https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication
- **Apple:** https://developer.apple.com/documentation/sign_in_with_apple

### مكتبات مساعدة:
- **NextAuth.js:** https://next-auth.js.org/ (الأفضل لـ Next.js)
- **Passport.js:** http://www.passportjs.org/
- **Grant:** https://github.com/simov/grant

---

## 🎉 الحالة الحالية

- ✅ **OAuth flow تجريبي يعمل 100%**
- ✅ **جميع الأزرار (5) مربوطة**
- ✅ **معالجة الأخطاء موجودة**
- ✅ **صفحة انتقالية جميلة**
- ✅ **جاهز للاختبار!**

### للتجربة:
1. افتح http://localhost:3000/login
2. اختر "وسائل التواصل"
3. اضغط على أي زر (Google, Facebook, إلخ)
4. راقب OAuth flow يعمل!

---

*تاريخ الإنشاء: 8 أكتوبر 2025*  
*الحالة: ✅ جاهز للاختبار والتطوير*

