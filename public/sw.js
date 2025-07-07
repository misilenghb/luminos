// 水晶日历 Service Worker
const CACHE_NAME = 'crystal-calendar-v1.0.0';
const STATIC_CACHE_NAME = 'crystal-calendar-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'crystal-calendar-dynamic-v1.0.0';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/daily-focus',
  '/energy-exploration',
  '/simple-design',
  '/creative-workshop',
  '/manifest.json',
  // 添加关键的CSS和JS文件（Next.js会自动生成）
];

// 需要缓存的API端点
const API_CACHE_PATTERNS = [
  /^https:\/\/api\./,
  /\/api\//,
];

// 安装事件 - 缓存静态资源
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static assets', error);
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 跳过非GET请求
  if (request.method !== 'GET') {
    return;
  }

  // 跳过chrome-extension和其他协议
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    handleRequest(request)
  );
});

// 处理请求的核心逻辑
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // 1. 静态资源 - 缓存优先策略
    if (isStaticAsset(url)) {
      return await cacheFirst(request, STATIC_CACHE_NAME);
    }
    
    // 2. API请求 - 网络优先策略
    if (isApiRequest(url)) {
      return await networkFirst(request, DYNAMIC_CACHE_NAME);
    }
    
    // 3. 页面请求 - 网络优先，离线时返回缓存
    if (isPageRequest(url)) {
      return await networkFirst(request, DYNAMIC_CACHE_NAME);
    }
    
    // 4. 其他请求 - 直接网络请求
    return await fetch(request);
    
  } catch (error) {
    console.error('Service Worker: Request failed', error);
    
    // 如果是页面请求且网络失败，返回离线页面
    if (isPageRequest(url)) {
      return await getOfflinePage();
    }
    
    throw error;
  }
}

// 缓存优先策略
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// 网络优先策略
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// 判断是否为静态资源
function isStaticAsset(url) {
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

// 判断是否为API请求
function isApiRequest(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.href)) ||
         url.pathname.startsWith('/api/');
}

// 判断是否为页面请求
function isPageRequest(url) {
  return url.origin === self.location.origin && 
         !isStaticAsset(url) && 
         !isApiRequest(url);
}

// 获取离线页面
async function getOfflinePage() {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const offlinePage = await cache.match('/');
  
  if (offlinePage) {
    return offlinePage;
  }
  
  // 如果没有缓存的首页，返回简单的离线页面
  return new Response(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>水晶日历 - 离线模式</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
          }
          .container { max-width: 400px; padding: 2rem; }
          h1 { margin-bottom: 1rem; }
          p { margin-bottom: 1.5rem; opacity: 0.9; }
          button { 
            background: rgba(255,255,255,0.2); 
            border: 1px solid rgba(255,255,255,0.3);
            color: white; 
            padding: 0.75rem 1.5rem; 
            border-radius: 0.5rem; 
            cursor: pointer;
            font-size: 1rem;
          }
          button:hover { background: rgba(255,255,255,0.3); }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔮 水晶日历</h1>
          <p>您当前处于离线模式。请检查网络连接后重试。</p>
          <button onclick="window.location.reload()">重新连接</button>
        </div>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// 推送通知事件
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: '您有新的能量洞察和建议！',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '查看详情',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: '关闭'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('水晶日历', options)
  );
});

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// 后台同步事件
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'energy-sync') {
    event.waitUntil(syncEnergyData());
  }
});

// 同步能量数据
async function syncEnergyData() {
  try {
    // 这里可以实现离线数据同步逻辑
    console.log('Service Worker: Syncing energy data...');
    
    // 获取离线存储的数据
    const offlineData = await getOfflineEnergyData();
    
    if (offlineData.length > 0) {
      // 发送到服务器
      await fetch('/api/energy/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offlineData)
      });
      
      // 清除离线数据
      await clearOfflineEnergyData();
      
      console.log('Service Worker: Energy data synced successfully');
    }
  } catch (error) {
    console.error('Service Worker: Error syncing energy data', error);
  }
}

// 获取离线能量数据（示例）
async function getOfflineEnergyData() {
  // 这里应该从IndexedDB或其他离线存储获取数据
  return [];
}

// 清除离线能量数据（示例）
async function clearOfflineEnergyData() {
  // 这里应该清除IndexedDB或其他离线存储的数据
}
