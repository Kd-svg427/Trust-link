// ============================================
// TrustLink Service Worker
// Cache-first for static assets, network-first for API
// ============================================

const STATIC_CACHE = 'trustlink-static-v10';
const DATA_CACHE = 'trustlink-data-v10';

// Static assets to pre-cache (app shell)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/config.js',
  '/css/styles.css',
  '/js/app.js',
  '/js/supabase.js',
  '/js/components/header.js',
  '/js/components/footer.js',
  '/js/components/product-card.js',
  '/js/components/modal.js',
  '/js/components/toast.js',
  '/js/push.js',
  '/js/pages/home.js',
  '/js/pages/products.js',
  '/js/pages/product-detail.js',
  '/js/pages/cart.js',
  '/js/pages/checkout.js',
  '/js/pages/order-success.js',
  '/js/pages/login.js',
  '/js/pages/buyer-dashboard.js',
  '/js/pages/vendor-dashboard.js',
  '/js/pages/admin-dashboard.js',
  '/js/pages/privacy.js',
  '/js/pages/terms.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/manifest.json'
];

// Offline fallback page
const OFFLINE_PAGE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TrustLink — Offline</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background: #0a0a0a;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 2rem;
    }
    .offline-container {
      max-width: 400px;
    }
    .offline-icon {
      font-size: 4rem;
      margin-bottom: 1.5rem;
    }
    h1 {
      font-size: 1.75rem;
      margin-bottom: 0.75rem;
      background: linear-gradient(135deg, #4CAF50, #FFB300);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      color: #9ca3af;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    button {
      background: linear-gradient(135deg, #1B5E20, #2E7D32);
      color: white;
      border: none;
      padding: 0.875rem 2rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }
    button:hover { transform: scale(1.05); }
  </style>
</head>
<body>
  <div class="offline-container">
    <div class="offline-icon">📡</div>
    <h1>You're Offline</h1>
    <p>It looks like you've lost your internet connection. TrustLink needs an active connection to load product data and process orders.</p>
    <button onclick="window.location.reload()">Try Again</button>
  </div>
</body>
</html>
`;

// ============================================
// Install — pre-cache static assets
// ============================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching app shell');
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn('[SW] Some assets failed to cache:', err);
          // Don't fail the install if some assets can't be cached
          return Promise.resolve();
        });
      })
      .then(() => self.skipWaiting())
  );
});

// ============================================
// Activate — clean up old caches
// ============================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DATA_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ============================================
// Fetch — routing strategy
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) return;

  // API calls (Supabase) → Network-first with cache fallback
  if (url.hostname.includes('supabase')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // CDN resources (fonts, Tailwind, Lucide, etc.) → Cache-first
  if (url.hostname !== location.hostname) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Static assets → Cache-first
  event.respondWith(cacheFirstStrategy(request));
});

// ============================================
// Strategies
// ============================================

async function cacheFirstStrategy(request) {
  try {
    const cached = await caches.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return new Response(OFFLINE_PAGE, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    throw err;
  }
}

async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    // Never cache authenticated API responses — contains user data
    // Only cache if response has a no-store or private cache hint, skip caching entirely for API
    return response;
  } catch (err) {
    // No offline fallback for API calls — fail loudly instead of serving stale data
    throw err;
  }
}
