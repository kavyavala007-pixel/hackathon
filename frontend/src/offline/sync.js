import api from '../services/api.js';
import { getUnsyncedRecords, markSynced } from './db.js';

/**
 * syncToServer — Multi-record sync
 * Fetches all unsynced records from IndexedDB and pushes them to the backend.
 */
export const syncToServer = async () => {
  const unsynced = await getUnsyncedRecords();
  
  if (!unsynced || unsynced.length === 0) {
    return { synced: 0 };
  }

  let successCount = 0;
  let failCount = 0;

  for (const record of unsynced) {
    try {
      // Stripping local IndexedDB internal fields before sending to server
      const { id, _syncedAt, ...data } = record;
      
      const response = await api.post('/sync', data);
      
      if (response.data.success) {
        // Mark this specific UNIQUE RECORD as synced by its auto-increment ID
        await markSynced(record.id);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Sync failed for record ${record.id}:`, error.message);
      failCount++;
    }
  }

  return { synced: successCount, failed: failCount };
};
