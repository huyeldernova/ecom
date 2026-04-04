// src/components/chat/ChatDrawer.tsx
'use client';

import { useEffect, useState } from 'react';
import { X, Plus, Search } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import ConversationList from './ConversationList';
import MessageThread from './MessageThread';
import NewConversationModal from './NewConversationModal';

const ChatDrawer = () => {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const {
    isOpen, setOpen,
    activeConversationId, setActiveConversation,
    loadConversations,
  } = useChatStore();

  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');

  // Load conversations khi mở drawer — chờ hydration xong mới gọi
  useEffect(() => {
    if (isOpen && isAuthenticated && _hasHydrated) {
      loadConversations();
    }
  }, [isOpen, isAuthenticated, _hasHydrated]);

  if (!isAuthenticated || !isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed bottom-20 right-4 z-50 w-[720px] max-w-[calc(100vw-2rem)]
                      h-[560px] bg-white rounded-2xl shadow-2xl border border-border
                      flex overflow-hidden animate-scale-in">

        {/* Sidebar */}
        <div className="w-[260px] border-r border-border flex flex-col shrink-0">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="font-head font-bold text-sm text-navy">Tin nhắn</span>
            <button
              onClick={() => setShowNew(true)}
              className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center
                         justify-center hover:bg-primary hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search */}
          <div className="px-3 py-2 border-b border-border">
            <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg">
              <Search className="w-3.5 h-3.5 text-light-gray shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm..."
                className="flex-1 text-xs bg-transparent text-navy placeholder:text-light-gray
                           focus:outline-none"
              />
            </div>
          </div>

          {/* List */}
          <ConversationList search={search} />
        </div>

        {/* Main thread */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeConversationId ? (
            <MessageThread conversationId={activeConversationId} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
                💬
              </div>
              <p className="font-semibold text-navy text-sm">Chọn cuộc trò chuyện</p>
              <p className="text-xs text-mid-gray">
                Chọn từ danh sách bên trái hoặc bắt đầu cuộc trò chuyện mới
              </p>
              <button
                onClick={() => setShowNew(true)}
                className="text-xs text-primary font-medium hover:underline"
              >
                + Cuộc trò chuyện mới
              </button>
            </div>
          )}
        </div>

        {/* Close */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-gray-100 text-mid-gray
                     flex items-center justify-center hover:bg-gray-200 transition-colors z-10"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {showNew && (
        <NewConversationModal onClose={() => setShowNew(false)} />
      )}
    </>
  );
};

export default ChatDrawer;