/**
 * Offline & Sync Utilities para SIMGEC
 * Gerencia sincronização de dados quando offline/online
 */

class OfflineSyncManager {
  constructor() {
    this.dbName = 'simgec-offline';
    this.version = 1;
    this.isOnline = navigator.onLine;
    this.pendingRequests = [];
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.initIndexedDB();
    this.syncWhenOnline();
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('[OfflineSync] Online - sincronizando dados...');
      this.syncPendingRequests();
      this.notifyUI('online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('[OfflineSync] Offline');
      this.notifyUI('offline');
    });
  }

  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('[OfflineSync] Erro ao abrir BD:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[OfflineSync] IndexedDB inicializado');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Tabela para pedidos pendentes
        if (!db.objectStoreNames.contains('pending-requests')) {
          const store = db.createObjectStore('pending-requests', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('status', 'status', { unique: false });
        }

        // Tabela para cache de dados (alunos, escolas, etc.)
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key', unique: true });
          cacheStore.createIndex('type', 'type', { unique: false });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Tabela para sincronização de dados locais
        if (!db.objectStoreNames.contains('local-changes')) {
          const changesStore = db.createObjectStore('local-changes', { keyPath: 'id', autoIncrement: true });
          changesStore.createIndex('resource', 'resource', { unique: false });
          changesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Guardar um pedido pendente para sincronizar depois
   */
  async addPendingRequest(method, url, body, headers = {}) {
    const token = localStorage.getItem('simgc_token');
    
    const request = {
      method,
      url,
      body,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...headers
      },
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction('pending-requests', 'readwrite');
      const store = transaction.objectStore('pending-requests');
      const addRequest = store.add(request);

      addRequest.onsuccess = () => {
        console.log('[OfflineSync] Pedido guardado:', addRequest.result);
        resolve(addRequest.result);
      };

      addRequest.onerror = () => {
        console.error('[OfflineSync] Erro ao guardar pedido:', addRequest.error);
        reject(addRequest.error);
      };
    });
  }

  /**
   * Sincronizar todos os pedidos pendentes
   */
  async syncPendingRequests() {
    if (!this.isOnline) {
      console.log('[OfflineSync] Sem internet - não é possível sincronizar agora');
      return false;
    }

    try {
      const requests = await this.getPendingRequests();
      
      if (requests.length === 0) {
        console.log('[OfflineSync] Sem pedidos pendentes');
        return true;
      }

      console.log('[OfflineSync] Sincronizando', requests.length, 'pedidos...');
      
      let successCount = 0;
      for (const req of requests) {
        try {
          const response = await fetch(req.url, {
            method: req.method,
            headers: req.headers,
            body: req.body ? JSON.stringify(req.body) : null
          });

          if (response.ok) {
            await this.removePendingRequest(req.id);
            successCount++;
            console.log('[OfflineSync] Sincronizado:', req.url);
          } else {
            console.warn('[OfflineSync] Erro:', req.url, response.status);
          }
        } catch (err) {
          console.error('[OfflineSync] Erro ao sincronizar:', req.url, err);
        }
      }

      console.log('[OfflineSync] Sincronização completa:', successCount, '/', requests.length);
      this.notifyUI('sync-complete', { success: successCount, total: requests.length });
      
      return successCount === requests.length;
    } catch (err) {
      console.error('[OfflineSync] Erro ao sincronizar:', err);
      return false;
    }
  }

  async getPendingRequests() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction('pending-requests', 'readonly');
      const store = transaction.objectStore('pending-requests');
      const index = store.index('status');
      const request = index.getAll('pending');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async removePendingRequest(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction('pending-requests', 'readwrite');
      const store = transaction.objectStore('pending-requests');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Guardar dados em cache
   */
  async cacheData(key, data, type = 'general') {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction('cache', 'readwrite');
      const store = transaction.objectStore('cache');
      
      const cacheEntry = {
        key,
        data,
        type,
        timestamp: new Date().toISOString()
      };

      const request = store.put(cacheEntry);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('[OfflineSync] Dados em cache:', key);
        resolve();
      };
    });
  }

  /**
   * Obter dados do cache
   */
  async getCachedData(key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction('cache', 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
    });
  }

  /**
   * Guardar mudança local para sincronização depois
   */
  async recordLocalChange(resource, action, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction('local-changes', 'readwrite');
      const store = transaction.objectStore('local-changes');

      const change = {
        resource,
        action, // 'create', 'update', 'delete'
        data,
        timestamp: new Date().toISOString(),
        synced: false
      };

      const request = store.add(change);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('[OfflineSync] Mudança local registada:', action, resource);
        resolve();
      };
    });
  }

  /**
   * Sincronizar quando online
   */
  syncWhenOnline() {
    if (this.isOnline) {
      this.syncPendingRequests();
    }
  }

  /**
   * Notificar UI de alterações
   */
  notifyUI(event, data = {}) {
    const event_obj = new CustomEvent('offline-sync', {
      detail: { event, ...data }
    });
    window.dispatchEvent(event_obj);
  }

  /**
   * Fazer fetch com suporte offline
   */
  async fetchWithOfflineSupport(url, options = {}) {
    const method = options.method || 'GET';
    const body = options.body;
    const headers = options.headers || {};

    try {
      // Tentar fetch normal
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: body ? JSON.stringify(body) : null
      });

      if (response.ok) {
        const data = await response.json();
        // Guardar em cache se for GET
        if (method === 'GET') {
          await this.cacheData(url, data, 'api-response');
        }
        return data;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.warn('[OfflineSync] Erro no fetch, tentando cache...', err);

      // Se for POST/PUT/DELETE offline, guardar pedido
      if (method !== 'GET') {
        if (!navigator.onLine) {
          await this.addPendingRequest(method, url, body, headers);
          return { offline: true, message: 'Pedido guardado - será sincronizado quando conectar' };
        }
      }

      // Para GET, tentar cache
      const cached = await this.getCachedData(url);
      if (cached) {
        console.log('[OfflineSync] Usando dados em cache para:', url);
        return { ...cached, fromCache: true, message: 'Dados em cache - podem estar desatualizados' };
      }

      throw err;
    }
  }
}

// Instanciar globalmente
const offlineSync = new OfflineSyncManager();

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = offlineSync;
}
