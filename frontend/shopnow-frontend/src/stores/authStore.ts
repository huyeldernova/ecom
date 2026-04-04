import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '@/types/auth.types';
import { useCartStore } from './cartStore';
import { useChatStore } from './chatStore';

interface AuthStore extends AuthState {
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
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
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      login: (accessToken, user) => {
        useCartStore.getState().clearCart();
        set({ accessToken, user, isAuthenticated: true, isLoading: false });

        // ✅ Khởi tạo WebSocket sau khi login
        useChatStore.getState().initSocket().catch(console.error);
      },

      logout: () => {
        useCartStore.getState().clearCart();

        // ✅ Disconnect WebSocket trước khi clear state
        useChatStore.getState().disconnectSocket();

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
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);

        if (state?.isAuthenticated) {
          useChatStore.getState().initSocket().catch(console.error);
        }
      },
    }
  )
);