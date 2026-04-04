'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';

export function useChatInit() {
  const isAuthenticated  = useAuthStore((s) => s.isAuthenticated);
  const _hasHydrated     = useAuthStore((s) => s._hasHydrated);
  const accessToken      = useAuthStore((s) => s.accessToken);
  const initSocket       = useChatStore((s) => s.initSocket);
  const disconnectSocket = useChatStore((s) => s.disconnectSocket);

  useEffect(() => {
    console.log('[useChatInit]', { _hasHydrated, isAuthenticated, hasToken: !!accessToken });

    if (!_hasHydrated) return;

    if (!isAuthenticated || !accessToken) {  // ✅ check cả accessToken
      disconnectSocket();
      return;
    }

    initSocket().catch(console.error);

  }, [isAuthenticated, _hasHydrated, accessToken]);  // ✅ thêm accessToken vào deps
}