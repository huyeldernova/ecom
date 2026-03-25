import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '@/types/auth.types';
import { useCartStore } from './cartStore';

interface AuthStore extends AuthState {
  login: (accessToken: string, user: User) => void;
  logout: () => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: (accessToken, user) => {
        useCartStore.getState().clearCart(); // ✅ xóa cart cũ
        set({ accessToken, user, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        useCartStore.getState().clearCart(); // ✅ xóa cart khi logout
        set({ accessToken: null, user: null, isAuthenticated: false });
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'shopnow-auth',
      partialize: (s) => ({
        accessToken: s.accessToken,
        user: s.user,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);