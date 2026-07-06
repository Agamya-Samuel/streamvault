import { openDB } from 'idb';

const DB_NAME = 'streamvault';
const DB_VERSION = 1;

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('shows')) {
          const showsStore = db.createObjectStore('shows', { keyPath: 'id' });
          showsStore.createIndex('startYear', 'startYear');
          showsStore.createIndex('primaryTitle', 'primaryTitle');
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta');
        }
        if (!db.objectStoreNames.contains('userData')) {
          db.createObjectStore('userData', { keyPath: 'uid' });
        }
      },
    });
  }
  return dbPromise;
}

export async function putShows(shows) {
  const db = await getDB();
  const tx = db.transaction('shows', 'readwrite');
  for (const show of shows) {
    await tx.store.put({ ...show, cachedAt: Date.now() });
  }
  await tx.done;
}

export async function getAllShows() {
  const db = await getDB();
  return db.getAll('shows');
}

export async function getShowById(id) {
  const db = await getDB();
  return db.get('shows', id);
}

export async function getShowCount() {
  const db = await getDB();
  return db.count('shows');
}

export async function getMeta(key) {
  const db = await getDB();
  return db.get('meta', key);
}

export async function setMeta(key, value) {
  const db = await getDB();
  return db.put('meta', value, key);
}

export async function getUserData(uid) {
  const db = await getDB();
  return db.get('userData', uid);
}

export async function putUserData(data) {
  const db = await getDB();
  return db.put('userData', data);
}
