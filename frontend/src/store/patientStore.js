import { create } from 'zustand';

/**
 * Patient Store — in-memory state for patient health data + predictions
 * Data is loaded from API and kept in sync with IndexedDB (Phase 5)
 */
const usePatientStore = create((set) => ({
  patientData: null,
  isLoading: false,
  error: null,

  // Prediction results (from ML service)
  prediction: null,

  setPatientData: (data) => set({ patientData: data, error: null }),

  updatePatientData: (fields) =>
    set((state) => ({
      patientData: state.patientData
        ? { ...state.patientData, ...fields }
        : fields,
    })),

  setPrediction: (prediction) => set({ prediction }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearPatientData: () => set({ patientData: null, prediction: null, error: null }),
}));

export default usePatientStore;
