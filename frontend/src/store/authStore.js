import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Auth Store — persisted to localStorage
 * Manages user session, JWT token, and logout
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },

      updateUser: (updatedFields) => {
        set((state) => ({
          user: { ...state.user, ...updatedFields },
        }));
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      getRole: () => get().user?.role || null,
      isPatient: () => get().user?.role === 'patient',
      isDoctor: () => get().user?.role === 'doctor',
    }),
    {
      name: 'medai-auth', // localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
