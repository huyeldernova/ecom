// src/components/chat/ChatBubble.tsx
'use client';

import { MessageCircle } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';

const ChatBubble = () => {
  const { isAuthenticated } = useAuthStore();
  const { isOpen, setOpen, unreadCount } = useChatStore();

  if (!isAuthenticated) return null;

  return (
    <button
      onClick={() => setOpen(!isOpen)}
      className="fixed bottom-4 right-4 z-40 w-14 h-14 rounded-2xl
                 bg-primary text-white shadow-lg shadow-primary/30
                 flex items-center justify-center
                 hover:bg-primary-dark hover:scale-105
                 active:scale-95 transition-all duration-200"
      aria-label="Mở chat"
    >
      <MessageCircle className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5
                         bg-navy text-white text-[10px] font-bold rounded-full
                         flex items-center justify-center border-2 border-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default ChatBubble;


// ─────────────────────────────────────────────────────────
// src/components/chat/NewConversationModal.tsx
// ─────────────────────────────────────────────────────────
// NOTE: đây là file riêng, đặt tại src/components/chat/NewConversationModal.tsx
// Dưới đây là nội dung của file đó: