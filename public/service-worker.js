const CACHE_NAME = 'simgec-v1';
const STATIC_ASSETS = [
  '/',
  '/login.html',
  '/dashboard.html',
  '/UI-Dashboard-Mockup.html',
  '/UI-Dashboard-Mockup.css',
  '/admin.html',
  '/chat.html',
  '/registrar-aluno.html',
  '/manifest.json',
  '/offline.html'
];

// Instalar Service Worker e fazer cache dos assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Fazendo cache de assets estáticos');
      return cache.addAll(STATIC_ASSETS);
    }).catch((err) => {
      console.error('[Service Worker] Erro ao fazer cache:', err);
    })
  );
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Ativado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia Network First com Cache Fallback para APIs
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar pedidos para URLs externas ou chrome-extension
  if (!url.origin.includes(self.location.origin)) {
    return;
  }

  // APIs - Network First (tenta sempre obter do servidor)
  if (url.pathname.startsWith('/') && (
    url.pathname.startsWith('/alunos') ||
    url.pathname.startsWith('/escolas') ||
    url.pathname.startsWith('/auth') ||
    url.pathname.startsWith('/analytics') ||
    url.pathname.startsWith('/admin-api') ||
    url.pathname.startsWith('/chat')
  )) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Guardar resposta bem-sucedida em cache
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Se falhar, tentar cache
          console.log('[Service Worker] Offline - usando cache para:', request.url);
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || new Response(
              JSON.stringify({
                message: 'Offline - dados em cache podem estar desatualizados',
                timestamp: new Date().toISOString()
              }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
  }

  // Assets estáticos - Cache First
  else if (
    request.method === 'GET' &&
    (url.pathname.endsWith('.html') ||
     url.pathname.endsWith('.css') ||
     url.pathname.endsWith('.js') ||
     url.pathname.endsWith('.json') ||
     url.pathname.endsWith('.svg') ||
     url.pathname.endsWith('.png') ||
     url.pathname.endsWith('.jpg') ||
     url.pathname.endsWith('.jpeg') ||
     url.pathname.endsWith('.gif') ||
     url.pathname.endsWith('.woff') ||
     url.pathname.endsWith('.woff2') ||
     url.pathname.endsWith('.ttf'))
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        });
      }).catch(() => {
        // Fallback para offline.html se aplicável
        if (request.destination === 'document') {
          return caches.match('/offline.html');
        }
        return new Response('Recurso não disponível offline', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
    );
  }

  // Para outros pedidos, usar padrão por defeito
  else {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response('Erro ao carregar recurso', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
    );
  }
});

// Background Sync - Sincronizar dados quando voltar online
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background Sync:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncPendingRequests());
  }
});

async function syncPendingRequests() {
  try {
    // Obter pedidos pendentes do IndexedDB (implementar depois)
    const db = await openIndexedDB();
    const pendingRequests = await getPendingRequests(db);
    
    for (const request of pendingRequests) {
      try {
        await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body ? JSON.stringify(request.body) : null
        });
        // Remover da fila após sucesso
        await removePendingRequest(db, request.id);
      } catch (err) {
        console.error('[Service Worker] Erro ao sincronizar:', err);
      }
    }
  } catch (err) {
    console.error('[Service Worker] Erro em sync:', err);
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('simgec-offline', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-requests')) {
        const store = db.createObjectStore('pending-requests', { keyPath: 'id', autoIncrement: true });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

function getPendingRequests(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('pending-requests', 'readonly');
    const store = transaction.objectStore('pending-requests');
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removePendingRequest(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('pending-requests', 'readwrite');
    const store = transaction.objectStore('pending-requests');
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
