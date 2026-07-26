// DamShop Hybrid High-Capacity Storage Engine (IndexedDB + LocalStorage Fallback)

const DB_NAME = 'DamShopDB';
const DB_VERSION = 2;
const STORES = ['categories', 'products', 'orders', 'wishlist', 'reviews', 'settings', 'cart'];

let dbInstance = null;

// Initialize IndexedDB
const initDB = () => {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      STORES.forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      });
    };

    request.onsuccess = (e) => {
      dbInstance = e.target.result;
      resolve(dbInstance);
    };

    request.onerror = (e) => {
      console.warn('IndexedDB unavailable, falling back to LocalStorage', e);
      resolve(null);
    };
  });
};

// Generic DB Read
export const getItem = async (key, fallbackData) => {
  try {
    const db = await initDB();
    if (db) {
      return new Promise((resolve) => {
        const tx = db.transaction(key, 'readonly');
        const store = tx.objectStore(key);
        const req = store.get('current_data');
        req.onsuccess = () => {
          if (req.result !== undefined) {
            resolve(req.result);
          } else {
            // Seed initial data if empty
            setItem(key, fallbackData);
            resolve(fallbackData);
          }
        };
        req.onerror = () => resolve(getFromLocalStorage(key, fallbackData));
      });
    }
  } catch (err) {
    console.warn('IndexedDB read error, using LocalStorage:', err);
  }
  return getFromLocalStorage(key, fallbackData);
};

// Generic DB Write
export const setItem = async (key, value) => {
  // Always update LocalStorage as fallback
  saveToLocalStorage(key, value);

  try {
    const db = await initDB();
    if (db) {
      const tx = db.transaction(key, 'readwrite');
      const store = tx.objectStore(key);
      store.put(value, 'current_data');
    }
  } catch (err) {
    console.warn('IndexedDB write error:', err);
  }
};

const getFromLocalStorage = (key, fallback) => {
  const data = localStorage.getItem(`damshop_${key}`);
  if (!data) {
    localStorage.setItem(`damshop_${key}`, JSON.stringify(fallback));
    return fallback;
  }
  return JSON.parse(data);
};

const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(`damshop_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage quota exceeded (Images might be large)', e);
  }
};

// Full Backup Export to JSON File
export const exportStoreBackup = async () => {
  const backup = {};
  for (const key of STORES) {
    backup[key] = await getItem(key, []);
  }
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `DamShop_Sauvegarde_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

// Full Backup Import from JSON File
export const importStoreBackup = (jsonContent) => {
  try {
    const data = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
    STORES.forEach(async (key) => {
      if (data[key]) {
        await setItem(key, data[key]);
      }
    });
    return true;
  } catch (e) {
    console.error('Erreur lors de l import de la sauvegarde:', e);
    return false;
  }
};
