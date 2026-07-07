import { openDB } from 'idb';

const DB_NAME    = 'medai-offline';
const DB_VERSION = 2; // Incremented for History Mode
const STORE_PATIENTS = 'patients';

/**
 * Open (or create) the IndexedDB database
 */
const getDB = () =>
  openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Re-create store for History Mode (Auto-incrementing ID)
      if (oldVersion < 2 && db.objectStoreNames.contains(STORE_PATIENTS)) {
        db.deleteObjectStore(STORE_PATIENTS);
      }
      
      if (!db.objectStoreNames.contains(STORE_PATIENTS)) {
        // Multi-record history using auto-incrementing ID
        db.createObjectStore(STORE_PATIENTS, { keyPath: 'id', autoIncrement: true });
      }
    },
  });

/**
 * Save (create) a new patient history record locally
 * @param {Object} data - must include `userId`
 */
export const savePatientRecord = async (data) => {
  const db = await getDB();
  // We use .add() to ensure a new record is created every time
  await db.add(STORE_PATIENTS, { ...data, _syncedAt: null });
  console.log('✅ History log saved to IndexedDB');
};

/**
 * Retrieve the latest patient record from local IndexedDB
 * @param {string} userId
 */
export const getPatientRecord = async (userId) => {
  const db = await getDB();
  const all = await db.getAll(STORE_PATIENTS);
  const userRecords = all.filter(r => r.userId === userId);
  return userRecords.length > 0 ? userRecords[userRecords.length - 1] : null;
};

/**
 * Mark a specific unique record as synced
 * @param {number} id - The Unique ID from IndexedDB
 */
export const markSynced = async (id) => {
  const db = await getDB();
  const record = await db.get(STORE_PATIENTS, id);
  if (record) {
    await db.put(STORE_PATIENTS, { ...record, _syncedAt: new Date().toISOString() });
  }
};

/**
 * Get all unsynced patient records
 */
export const getUnsyncedRecords = async () => {
  const db = await getDB();
  const all = await db.getAll(STORE_PATIENTS);
  return all.filter((r) => !r._syncedAt);
};
