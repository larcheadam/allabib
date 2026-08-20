// sw.js - Service Worker for Etablissement Allabib
const CACHE_NAME = 'allabib-cache-v2';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './logo.jpg',
  './icon-192.png',
  './icon-512.png'
];

// تثبيت ملف الخدمة وحفظ الملفات الثابتة في الذاكرة المؤقتة
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// تفعيل ملف الخدمة وحذف النسخ القديمة من الذاكرة المؤقتة
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// التعامل مع طلبات الملفات (استراتيجية الشبكة أولاً مع الرجوع للمؤقتة عند انقطاع الاتصال)
self.addEventListener('fetch', (e) => {
  // عدم تخزين طلبات Supabase أو Cloudinary في الكاش المحلي لضمان حداثة البيانات
  if (e.request.url.includes('supabase.co') || e.request.url.includes('cloudinary.com')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // تحديث الكاش بالملف الجديد المستلم
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, resClone);
        });
        return response;
      })
      .catch(() => {
        // عند فشل الاتصال، يتم تقديم الملف من الكاش
        return caches.match(e.request);
      })
  );
});

// استقبال الإشعارات المنبثقة من السيرفر (Push Notifications)
self.addEventListener('push', (e) => {
  let data = { title: 'مؤسسة اللبيب', body: 'تنبيه جديد من المؤسسة', icon: 'logo.jpg' };
  
  if (e.data) {
    try {
      data = e.data.json();
    } catch (err) {
      data = { title: 'مؤسسة اللبيب', body: e.data.text(), icon: 'logo.jpg' };
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || 'logo.jpg',
    badge: 'logo.jpg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || self.registration.scope
    }
  };

  e.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// التوجيه عند النقر على الإشعار
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const targetUrl = e.notification.data.url;
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
