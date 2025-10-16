// Service Worker - نظام التخزين المتقدم ⚡⚡⚡
// يوفر: سرعة فائقة + عمل بدون إنترنت + PWA كامل

const CACHE_VERSION = 'ain-oman-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;
const API_CACHE = `${CACHE_VERSION}-api`;

// الملفات الثابتة المهمة (يتم تخزينها عند التثبيت)
const STATIC_ASSETS = [
  '/',
  '/properties',
  '/offline.html',
  '/manifest.json',
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('⚡ Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('⚡ Service Worker: Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('✅ Service Worker: Installed successfully!');
      return self.skipWaiting(); // تفعيل فوري
    })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  console.log('⚡ Service Worker: Activating...');
  
  event.waitUntil(
    // حذف الـ caches القديمة
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('ain-oman-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== IMAGE_CACHE && name !== API_CACHE)
          .map((name) => {
            console.log('🗑️ Service Worker: Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activated!');
      return self.clients.claim(); // التحكم في جميع الصفحات فوراً
    })
  );
});

// استراتيجية Fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // تجاهل طلبات Chrome Extension
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // تجاهل طلبات WebSocket
  if (request.headers.get('upgrade') === 'websocket') {
    return;
  }

  // 1. API Requests: Network-First مع Fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // 2. Images: Cache-First (أسرع استراتيجية للصور)
  if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|avif)$/i)) {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // 3. Static Assets: Cache-First مع تحديث في الخلفية
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // 4. HTML Pages: Network-First مع Fallback
  if (request.mode === 'navigate') {
    event.respondWith(handlePageRequest(request));
    return;
  }

  // 5. الافتراضي: Network-First
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

// معالج طلبات API: Network-First مع Cache Fallback
async function handleAPIRequest(request) {
  try {
    // محاولة الشبكة أولاً
    const networkResponse = await fetch(request);
    
    // إذا نجحت، احفظ في الـ cache
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // إذا فشلت الشبكة، استخدم الـ cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('📦 Service Worker: Serving API from cache:', request.url);
      return cachedResponse;
    }
    
    // لا شبكة ولا cache - أرجع خطأ
    return new Response(
      JSON.stringify({ 
        error: 'offline',
        message: 'لا يوجد اتصال بالإنترنت والبيانات غير متوفرة محلياً'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// معالج الصور: Cache-First (أسرع!)
async function handleImageRequest(request) {
  // تحقق من الـ cache أولاً
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    console.log('⚡ Service Worker: Image from cache (instant!):', request.url);
    return cachedResponse;
  }
  
  try {
    // إذا لم توجد، اجلبها من الشبكة
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // احفظها في الـ cache للمستقبل
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // صورة placeholder عند الفشل
    return new Response(
      `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#e5e7eb"/>
        <text x="50%" y="50%" text-anchor="middle" fill="#9ca3af" font-size="16">لا يوجد اتصال</text>
      </svg>`,
      {
        headers: { 'Content-Type': 'image/svg+xml' }
      }
    );
  }
}

// معالج الملفات الثابتة: Cache-First مع Stale-While-Revalidate
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // أرجع من الـ cache فوراً
    console.log('⚡ Service Worker: Static asset from cache:', request.url);
    
    // تحديث في الخلفية (Stale-While-Revalidate)
    fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        caches.open(STATIC_CACHE).then((cache) => {
          cache.put(request, networkResponse);
        });
      }
    }).catch(() => {});
    
    return cachedResponse;
  }
  
  // إذا لم توجد، اجلبها واحفظها
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

// معالج الصفحات: Network-First مع Offline Fallback
async function handlePageRequest(request) {
  try {
    // محاولة الشبكة أولاً
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // احفظ في الـ cache
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // إذا فشلت، جرّب الـ cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('📦 Service Worker: Page from cache:', request.url);
      return cachedResponse;
    }
    
    // لا شبكة ولا cache - أرجع صفحة offline
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
    
    // إذا حتى صفحة offline غير موجودة
    return new Response(
      `<!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>لا يوجد اتصال - عين عُمان</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-align: center;
            }
            .container {
              max-width: 500px;
              padding: 40px;
            }
            h1 { font-size: 48px; margin: 0 0 20px; }
            p { font-size: 18px; margin: 10px 0; }
            button {
              background: white;
              color: #667eea;
              border: none;
              padding: 15px 30px;
              font-size: 16px;
              border-radius: 8px;
              cursor: pointer;
              margin-top: 20px;
              font-weight: bold;
            }
            button:hover { transform: scale(1.05); }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚠️</h1>
            <h2>لا يوجد اتصال بالإنترنت</h2>
            <p>تحقق من اتصالك بالإنترنت وحاول مرة أخرى</p>
            <button onclick="window.location.reload()">إعادة المحاولة</button>
          </div>
        </body>
      </html>`,
      {
        status: 503,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    );
  }
}

// Background Sync للطلبات الفاشلة
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-properties') {
    event.waitUntil(syncProperties());
  }
});

async function syncProperties() {
  console.log('🔄 Service Worker: Syncing properties...');
  // يمكن إضافة منطق المزامنة هنا
}

// Push Notifications (جاهز للمستقبل)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'عين عُمان';
  const options = {
    body: data.body || 'لديك إشعار جديد',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: data.url || '/',
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});

console.log('✅ Service Worker: Loaded and ready!');
