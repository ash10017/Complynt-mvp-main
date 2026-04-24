/* sw.js — Complynt Service Worker */

const CACHE = 'complynt-v2';
const PRECACHE = [
  '/index.html',
  '/dashboard.html',
  '/people.html',
  '/onboarding.html',
  '/styles.css',
  '/app.css',
  '/app.js',
  '/dashboard.js',
  '/people.js',
  '/onboarding.js',
  '/data/compliances.js',
  '/manifest.json',
  '/icons/icon.svg',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      return Promise.allSettled(PRECACHE.map(url => c.add(url).catch(() => {})));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Never cache Firebase, Google APIs, or cross-origin requests
  if (
    url.includes('firebaseio.com') ||
    url.includes('firebase.googleapis.com') ||
    url.includes('googleapis.com') ||
    url.includes('gstatic.com') ||
    e.request.method !== 'GET'
  ) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return response;
      }).catch(() => {
        if (e.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

self.addEventListener('push', e => {
  if (!e.data) return;
  const data = e.data.json();
  e.waitUntil(
    self.registration.showNotification(data.title || 'Complynt Alert', {
      body: data.body || 'You have a compliance deadline approaching.',
      icon: '/icons/icon.svg',
      badge: '/icons/icon.svg',
      tag: data.tag || 'complynt',
      data: { url: data.url || '/dashboard.html' },
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = e.notification.data && e.notification.data.url
    ? e.notification.data.url
    : '/dashboard.html';
  e.waitUntil(clients.openWindow(target));
});
