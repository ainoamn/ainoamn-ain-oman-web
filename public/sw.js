// public/sw.js
// Service Worker للتخزين المؤقت والأداء الفائق ⚡

const CACHE_NAME = 'ain-oman-v1';
const STATIC_CACHE = 'ain-oman-static-v1';
const DYNAMIC_CACHE = 'ain-oman-dynamic-v1';
const IMAGE_CACHE = 'ain-oman-images-v1';

// الملفات الثابتة للتخزين المؤقت
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
];

// أنماط التخزين المؤقت
const CACHE_STRATEGIES = {
  // تخزين مؤقت أولاً، ثم الشبكة
  CACHE_FIRST: 'cache-first',
  // الشبكة أولاً، ثم التخزين المؤقت
  NETWORK_FIRST: 'network-first',
  // الشبكة فقط
  NETWORK_ONLY: 'network-only',
  // التخزين المؤقت فقط
  CACHE_ONLY: 'cache-only',
  // تحديث في الخلفية
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
};

// تحديد استراتيجية التخزين المؤقت حسب نوع الطلب
function getCacheStrategy(url) {
  // صور - تخزين مؤقت أولاً
  if (url.match(/\.(jpg|jpeg|png|gif|webp|avif|svg|ico)$/i)) {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }

  // CSS & JS - stale while revalidate
  if (url.match(/\.(css|js)$/i)) {
    return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
  }

  // API - الشبكة أولاً
  if (url.includes('/api/')) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }

  // صفحات HTML - الشبكة أولاً مع fallback
  return CACHE_STRATEGIES.NETWORK_FIRST;
}

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );

  self.skipWaiting();
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');

  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => {
            return (
              key !== CACHE_NAME &&
              key !== STATIC_CACHE &&
              key !== DYNAMIC_CACHE &&
              key !== IMAGE_CACHE
            );
          })
          .map((key) => {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          })
      );
    })
  );

  self.clients.claim();
});

// استراتيجية التخزين المؤقت أولاً
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    throw error;
  }
}

// استراتيجية الشبكة أولاً
async function networkFirst(request, cacheName, timeout = 3000) {
  const cache = await caches.open(cacheName);

  try {
    const networkPromise = fetch(request);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Network timeout')), timeout)
    );

    const response = await Promise.race([networkPromise, timeoutPromise]);

    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }

    // إذا كان طلب HTML وفشل، أرجع صفحة offline
    if (request.destination === 'document') {
      return cache.match('/offline.html');
    }

    throw error;
  }
}

// استراتيجية stale-while-revalidate
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // أحضر النسخة الجديدة في الخلفية
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });

  // أرجع النسخة المخزنة فورًا إن وجدت
  return cached || fetchPromise;
}

// معالجة الطلبات
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // تجاهل الطلبات غير HTTP/HTTPS
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // تجاهل chrome-extension وغيرها
  if (url.origin !== self.location.origin) {
    return;
  }

  const strategy = getCacheStrategy(url.pathname);

  let responsePromise;

  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      responsePromise = cacheFirst(
        request,
        url.pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|svg|ico)$/i)
          ? IMAGE_CACHE
          : DYNAMIC_CACHE
      );
      break;

    case CACHE_STRATEGIES.NETWORK_FIRST:
      responsePromise = networkFirst(request, DYNAMIC_CACHE);
      break;

    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      responsePromise = staleWhileRevalidate(request, DYNAMIC_CACHE);
      break;

    case CACHE_STRATEGIES.NETWORK_ONLY:
      responsePromise = fetch(request);
      break;

    case CACHE_STRATEGIES.CACHE_ONLY:
      responsePromise = caches.match(request);
      break;

    default:
      responsePromise = networkFirst(request, DYNAMIC_CACHE);
  }

  event.respondWith(responsePromise);
});

// معالجة الرسائل من الصفحة
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((keys) => {
        return Promise.all(keys.map((key) => caches.delete(key)));
      })
    );
  }
});

// Background Sync للعمل دون اتصال
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // مزامنة البيانات المعلقة
  console.log('[SW] Syncing data...');
}

// Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'عين عُمان';
  const options = {
    body: data.body || 'لديك إشعار جديد',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: data.url,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// معالجة نقر الإشعار
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.notification.data) {
    event.waitUntil(clients.openWindow(event.notification.data));
  }
});

console.log('[SW] Service Worker loaded successfully! ⚡');


