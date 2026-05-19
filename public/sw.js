const CACHE_NAME = 'executive-os-v2';
const OFFLINE_URL = '/offline';

const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
];

// Simple IndexedDB Wrapper for Service Worker
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ExecutiveOS-DB', 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('api-cache')) {
        db.createObjectStore('api-cache');
      }
      if (!db.objectStoreNames.contains('offline-mutations')) {
        db.createObjectStore('offline-mutations', { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getCachedApi(url) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('api-cache', 'readonly');
    const store = tx.objectStore('api-cache');
    const request = store.get(url);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function setCachedApi(url, data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('api-cache', 'readwrite');
    const store = tx.objectStore('api-cache');
    const request = store.put(data, url);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function queueMutation(url, method, headers, body) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline-mutations', 'readwrite');
    const store = tx.objectStore('offline-mutations');
    const request = store.add({ url, method, headers, body, timestamp: Date.now() });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle API GET Requests
  if (url.pathname.startsWith('/api/') && event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request)
        .then(async (response) => {
          const clone = response.clone();
          if (response.status === 200) {
            const data = await clone.json();
            await setCachedApi(event.request.url, data);
          }
          return response;
        })
        .catch(async () => {
          const cachedData = await getCachedApi(event.request.url);
          if (cachedData) {
            return new Response(JSON.stringify(cachedData), {
              headers: { 'Content-Type': 'application/json' },
            });
          }
          return new Response(JSON.stringify({ error: 'Offline and no cache' }), {
            status: 503, headers: { 'Content-Type': 'application/json' },
          });
        })
    );
    return;
  }

  // Handle API Mutations (POST/PUT/DELETE)
  if (url.pathname.startsWith('/api/') && ['POST', 'PUT', 'DELETE'].includes(event.request.method)) {
    event.respondWith(
      fetch(event.request.clone())
        .catch(async () => {
          // If offline, queue the mutation
          const headers = {};
          for (let [key, value] of event.request.headers.entries()) {
            headers[key] = value;
          }
          const bodyText = await event.request.clone().text();
          
          await queueMutation(event.request.url, event.request.method, headers, bodyText);
          
          // Request background sync
          if ('sync' in self.registration) {
            try {
              await self.registration.sync.register('sync-mutations');
            } catch (e) {
              console.error('Sync registration failed:', e);
            }
          }

          return new Response(JSON.stringify({ 
            success: true, 
            offline: true, 
            message: 'Action queued for background sync' 
          }), {
            status: 202,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // Handle Static & Document requests
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Stale-while-revalidate pattern for static assets
          fetch(event.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
              });
            }
          }).catch(() => {});
          return cachedResponse;
        }

        return fetch(event.request)
          .then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          })
          .catch(async () => {
            if (event.request.mode === 'navigate') {
              const offlineResponse = await caches.match(OFFLINE_URL);
              if (offlineResponse) return offlineResponse;
            }
            return new Response('Offline', {
              status: 503, headers: { 'Content-Type': 'text/plain' },
            });
          });
      })
    );
  }
});

// Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-mutations') {
    event.waitUntil(processMutationQueue());
  }
});

async function processMutationQueue() {
  const db = await openDB();
  const tx = db.transaction('offline-mutations', 'readwrite');
  const store = tx.objectStore('offline-mutations');
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = async () => {
      const mutations = request.result;
      for (const mutation of mutations) {
        try {
          const response = await fetch(mutation.url, {
            method: mutation.method,
            headers: mutation.headers,
            body: mutation.body || null
          });
          
          if (response.ok) {
            // Delete from queue if successful
            const delTx = db.transaction('offline-mutations', 'readwrite');
            delTx.objectStore('offline-mutations').delete(mutation.id);
          }
        } catch (e) {
          console.error('Sync failed for mutation:', mutation, e);
          // Stop processing if we hit a network error
          break;
        }
      }
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

// Push Notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: data.data || { url: '/' },
      actions: data.actions || []
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Executive OS', options)
    );
  } catch (e) {
    console.error('Error handling push event:', e);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // If a specific action was clicked
  if (event.action) {
    if (event.action === 'approve') {
      // Background sync approval logic
      if (event.notification.data.approvalUrl) {
        event.waitUntil(
          fetch(event.notification.data.approvalUrl, { method: 'POST' })
        );
      }
    }
  } else {
    // Default click behavior: open the app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('/') && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url || '/');
        }
      })
    );
  }
});
