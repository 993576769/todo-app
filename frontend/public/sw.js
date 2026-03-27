// Service Worker for offline support
const CACHE_NAME = 'todo-app-v2'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
]

// 安装事件 - 缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// 请求拦截 - 网络优先，离线时使用缓存
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 只处理同源请求和 http/https 协议
  if (!url.protocol.startsWith('http')) {
    return
  }

  // POST/PUT/DELETE 请求不缓存，直接走网络
  if (request.method !== 'GET') {
    event.respondWith(fetch(request))
    return
  }

  // API 请求：网络优先
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 只缓存成功的 GET 响应
          if (response.ok && request.method === 'GET') {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // 离线时返回缓存
          return caches.match(request)
        })
    )
    return
  }

  // 静态资源：缓存优先
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }
      return fetch(request).then((response) => {
        // 只缓存成功的响应
        if (response.ok && request.method === 'GET') {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
    })
  )
})

// 后台同步
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-todos') {
    event.waitUntil(syncTodos())
  }
})

async function syncTodos() {
  console.log('Background sync: syncing todos...')
}

// 推送通知
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Todo App', {
      body: data.body || '你有新的提醒',
      icon: '/icons/icon-192.png',
      data: data.url
    })
  )
})

// 通知点击
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === event.notification.data && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data || '/')
      }
    })
  )
})
