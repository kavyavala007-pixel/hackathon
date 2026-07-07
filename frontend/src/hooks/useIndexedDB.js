import { useCallback } from 'react';
import { getPatientRecord, savePatientRecord } from '../offline/db.js';

/**
 * useIndexedDB — convenience hook for patient record persistence
 * Used in Phase 5 offline implementation; stubs are safe to use now
 */
const useIndexedDB = () => {
  const saveRecord = useCallback(async (data) => {
    try {
      await savePatientRecord(data);
    } catch (err) {
      console.warn('[IndexedDB] Save failed:', err);
    }
  }, []);

  const loadRecord = useCallback(async (userId) => {
    try {
      return await getPatientRecord(userId);
    } catch (err) {
      console.warn('[IndexedDB] Load failed:', err);
      return null;
    }
  }, []);

  return { saveRecord, loadRecord };
};

export default useIndexedDB;
