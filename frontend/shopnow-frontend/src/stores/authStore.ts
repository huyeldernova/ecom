import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '@/types/auth.types';

interface AuthStore extends AuthState {
  login: (accessToken: string, user: User) => void;
  logout: () => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: (accessToken, user) =>
        set({ accessToken, user, isAuthenticated: true, isLoading: false }),

      logout: () =>
        set({ accessToken: null, user: null, isAuthenticated: false }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'shopnow-auth',
      // Chỉ persist token + user, không persist isLoading
      partialize: (s) => ({ accessToken: s.accessToken, user: s.user }),
    }
  )
);
