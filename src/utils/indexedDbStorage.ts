import { AqarDatabaseState, OfflineQueuedAction } from '../types/aqar';

const DB_NAME = 'aqarplus_offline_db';
const DB_VERSION = 1;
const STORE_SNAPSHOTS = 'snapshots';
const STORE_QUEUE = 'sync_queue';
const STORE_ATTACHMENTS = 'attachments';
const STORE_META = 'kv_meta';

const LEGACY_STATE_KEY = 'aqarplus_cached_state_v1';
const LEGACY_QUEUE_KEY = 'aqarplus_offline_queue_v1';

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_SNAPSHOTS)) {
          db.createObjectStore(STORE_SNAPSHOTS);
        }
        if (!db.objectStoreNames.contains(STORE_QUEUE)) {
          db.createObjectStore(STORE_QUEUE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_ATTACHMENTS)) {
          db.createObjectStore(STORE_ATTACHMENTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_META)) {
          db.createObjectStore(STORE_META);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      const req = fn(store);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function loadCachedStateIdb(): Promise<AqarDatabaseState | null> {
  const val = await withStore<AqarDatabaseState>(STORE_SNAPSHOTS, 'readonly', (s) =>
    s.get('latest_state')
  );
  if (val && Array.isArray(val.properties)) return val;
  return null;
}

export async function saveCachedStateIdb(state: AqarDatabaseState): Promise<void> {
  await withStore(STORE_SNAPSHOTS, 'readwrite', (s) => s.put(state, 'latest_state'));
}

export async function loadOfflineQueueIdb(): Promise<OfflineQueuedAction[]> {
  const db = await openDb();
  if (!db) return [];
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_QUEUE, 'readonly');
      const store = tx.objectStore(STORE_QUEUE);
      const req = store.getAll();
      req.onsuccess = () => {
        const rows = (req.result as OfflineQueuedAction[] | undefined) || [];
        rows.sort((a, b) => a.queuedAt.localeCompare(b.queuedAt));
        resolve(rows);
      };
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

export async function replaceOfflineQueueIdb(queue: OfflineQueuedAction[]): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE_QUEUE, 'readwrite');
      const store = tx.objectStore(STORE_QUEUE);
      store.clear();
      for (const item of queue) {
        store.put(item);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function saveMetaIdb(key: string, value: unknown): Promise<void> {
  await withStore(STORE_META, 'readwrite', (s) => s.put(value, key));
}

export async function loadMetaIdb<T>(key: string): Promise<T | null> {
  return withStore<T>(STORE_META, 'readonly', (s) => s.get(key));
}

export async function saveAttachmentIdb(id: string, dataUrl: string, mimeType?: string): Promise<void> {
  await withStore(STORE_ATTACHMENTS, 'readwrite', (s) =>
    s.put({ id, dataUrl, mimeType: mimeType || 'application/octet-stream', savedAt: new Date().toISOString() })
  );
}

/**
 * One-time safe migration of legacy localStorage snapshots/queues into IndexedDB
 * to eliminate 5MB QuotaExceededError data loss.
 */
export async function migrateLegacyLocalStorageToIdb(): Promise<{
  migratedState: AqarDatabaseState | null;
  migratedQueue: OfflineQueuedAction[];
}> {
  let migratedState: AqarDatabaseState | null = null;
  let migratedQueue: OfflineQueuedAction[] = [];

  if (typeof window === 'undefined') {
    return { migratedState, migratedQueue };
  }

  try {
    const rawState = window.localStorage.getItem(LEGACY_STATE_KEY);
    if (rawState) {
      const parsed = JSON.parse(rawState) as AqarDatabaseState;
      if (parsed && Array.isArray(parsed.properties)) {
        const existing = await loadCachedStateIdb();
        if (!existing) {
          await saveCachedStateIdb(parsed);
        }
        migratedState = parsed;
      }
      window.localStorage.removeItem(LEGACY_STATE_KEY);
    }
  } catch {
    // ignore corrupt legacy cache
  }

  try {
    const rawQueue = window.localStorage.getItem(LEGACY_QUEUE_KEY);
    if (rawQueue) {
      const parsedQueue = JSON.parse(rawQueue) as OfflineQueuedAction[];
      if (Array.isArray(parsedQueue) && parsedQueue.length > 0) {
        const existingQueue = await loadOfflineQueueIdb();
        const normalized = parsedQueue.map((item) => ({
          ...item,
          operationId: item.operationId || item.idempotencyKey || item.id,
        }));
        const merged = [...existingQueue];
        const seen = new Set(existingQueue.map((x) => x.operationId || x.id));
        for (const item of normalized) {
          if (!seen.has(item.operationId || item.id)) {
            merged.push(item);
          }
        }
        await replaceOfflineQueueIdb(merged);
        migratedQueue = merged;
      }
      window.localStorage.removeItem(LEGACY_QUEUE_KEY);
    }
  } catch {
    // ignore corrupt legacy queue
  }

  return { migratedState, migratedQueue };
}
