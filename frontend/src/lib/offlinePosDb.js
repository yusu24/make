/**
 * Offline POS Database Helper using Browser Native IndexedDB
 * Database: bizora_pos_offline_db
 */

const DB_NAME = 'bizora_pos_offline_db';
const DB_VERSION = 1;

/**
 * Open or initialize the IndexedDB database
 * @returns {Promise<IDBDatabase>}
 */
export function openPosDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported by this browser.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Products cache store
      if (!db.objectStoreNames.contains('products')) {
        const prodStore = db.createObjectStore('products', { keyPath: 'id' });
        prodStore.createIndex('barcode', 'barcode', { unique: false });
        prodStore.createIndex('name', 'name', { unique: false });
      }

      // Categories cache store
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id' });
      }

      // Customers cache store
      if (!db.objectStoreNames.contains('customers')) {
        db.createObjectStore('customers', { keyPath: 'id' });
      }

      // Staff cache store
      if (!db.objectStoreNames.contains('staff')) {
        db.createObjectStore('staff', { keyPath: 'id' });
      }

      // Settings cache store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }

      // Offline Transactions Queue
      if (!db.objectStoreNames.contains('offline_transactions')) {
        const txStore = db.createObjectStore('offline_transactions', { keyPath: 'offline_id' });
        txStore.createIndex('status', 'status', { unique: false });
        txStore.createIndex('created_at', 'created_at', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save master data (products, categories, customers, staff, settings) to IndexedDB cache
 */
export async function cacheMasterData({ products = [], categories = [], customers = [], staff = [], settings = {} }) {
  const db = await openPosDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['products', 'categories', 'customers', 'staff', 'settings'], 'readwrite');
    
    // Save products
    const prodStore = tx.objectStore('products');
    prodStore.clear();
    products.forEach((p) => prodStore.put(p));

    // Save categories
    const catStore = tx.objectStore('categories');
    catStore.clear();
    categories.forEach((c) => catStore.put(c));

    // Save customers
    const custStore = tx.objectStore('customers');
    custStore.clear();
    customers.forEach((c) => custStore.put(c));

    // Save staff
    const staffStore = tx.objectStore('staff');
    staffStore.clear();
    staff.forEach((s) => staffStore.put(s));

    // Save settings
    const setStore = tx.objectStore('settings');
    setStore.put({ key: 'pos_settings', value: settings, updated_at: new Date().toISOString() });

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Retrieve cached products from IndexedDB
 */
export async function getCachedProducts() {
  const db = await openPosDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('products', 'readonly');
    const store = tx.objectStore('products');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieve cached categories
 */
export async function getCachedCategories() {
  const db = await openPosDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('categories', 'readonly');
    const store = tx.objectStore('categories');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieve cached customers
 */
export async function getCachedCustomers() {
  const db = await openPosDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('customers', 'readonly');
    const store = tx.objectStore('customers');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieve cached staff
 */
export async function getCachedStaff() {
  const db = await openPosDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('staff', 'readonly');
    const store = tx.objectStore('staff');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieve cached settings
 */
export async function getCachedSettings() {
  const db = await openPosDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');
    const req = store.get('pos_settings');
    req.onsuccess = () => resolve(req.result?.value || { tax_rate: 0, receipt_footer: '' });
    req.onerror = () => reject(req.error);
  });
}

/**
 * Store an offline transaction into the pending queue
 */
export async function saveOfflineTransaction(offlineTx) {
  const db = await openPosDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['offline_transactions', 'products'], 'readwrite');
    const txStore = tx.objectStore('offline_transactions');
    const prodStore = tx.objectStore('products');

    // Put transaction to queue
    txStore.put({
      offline_id: offlineTx.offline_id || `OFF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      invoice_no: offlineTx.invoice_no,
      payload: offlineTx.payload,
      receipt_data: offlineTx.receipt_data,
      created_at: offlineTx.created_at || new Date().toISOString(),
      status: 'PENDING', // PENDING, SYNCING, SYNCED, FAILED
      error_message: null,
      sync_attempts: 0
    });

    // Deduct stock locally from cached products
    if (Array.isArray(offlineTx.payload?.items)) {
      offlineTx.payload.items.forEach((item) => {
        const getReq = prodStore.get(item.product_id);
        getReq.onsuccess = () => {
          const product = getReq.result;
          if (product) {
            const deduct = Number(item.qty || 1) * Number(item.conversion || 1);
            product.stock = Math.max(0, (Number(product.stock) || 0) - deduct);
            prodStore.put(product);
          }
        };
      });
    }

    tx.oncomplete = () => resolve(offlineTx);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get all pending offline transactions
 */
export async function getPendingOfflineTransactions() {
  const db = await openPosDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_transactions', 'readonly');
    const store = tx.objectStore('offline_transactions');
    const req = store.getAll();
    req.onsuccess = () => {
      const all = req.result || [];
      const pending = all.filter(t => t.status === 'PENDING' || t.status === 'FAILED');
      resolve(pending);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Get count and summary of offline transactions
 */
export async function getOfflineQueueStats() {
  const db = await openPosDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_transactions', 'readonly');
    const store = tx.objectStore('offline_transactions');
    const req = store.getAll();
    req.onsuccess = () => {
      const all = req.result || [];
      const pending = all.filter(t => t.status === 'PENDING' || t.status === 'FAILED');
      const synced = all.filter(t => t.status === 'SYNCED');
      resolve({
        total: all.length,
        pendingCount: pending.length,
        syncedCount: synced.length,
        pendingItems: pending
      });
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Update transaction status after sync attempt
 */
export async function updateOfflineTransactionStatus(offline_id, status, error_message = null) {
  const db = await openPosDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_transactions', 'readwrite');
    const store = tx.objectStore('offline_transactions');
    const getReq = store.get(offline_id);

    getReq.onsuccess = () => {
      const record = getReq.result;
      if (record) {
        record.status = status;
        record.error_message = error_message;
        record.sync_attempts = (record.sync_attempts || 0) + 1;
        record.synced_at = status === 'SYNCED' ? new Date().toISOString() : record.synced_at;
        store.put(record);
      }
    };

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Remove synced offline transactions older than X hours (housekeeping)
 */
export async function cleanupSyncedOfflineTransactions() {
  const db = await openPosDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_transactions', 'readwrite');
    const store = tx.objectStore('offline_transactions');
    const req = store.getAll();

    req.onsuccess = () => {
      const all = req.result || [];
      all.forEach((item) => {
        if (item.status === 'SYNCED') {
          store.delete(item.offline_id);
        }
      });
    };

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}
