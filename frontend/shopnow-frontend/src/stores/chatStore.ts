'use client';

import { create } from 'zustand';
import { ChatMessage, Conversation } from '@/types/chat.types';
import { chatApi, chatSocket } from '@/services/chatService';

interface ChatStore {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, ChatMessage[]>;
  unreadCount: number;
  isOpen: boolean;
  isLoading: boolean;
  isSending: boolean;
  _socketInitialized: boolean;

  setOpen: (open: boolean) => void;
  setActiveConversation: (id: string | null) => void;
  initSocket: () => Promise<void>;
  disconnectSocket: () => void;
  createSupportConversation: () => Promise<Conversation | null>;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  appendMessage: (msg: ChatMessage) => void;
  addConversation: (conv: Conversation) => void;
  markRead: (conversationId: string) => void;
  setSending: (v: boolean) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  unreadCount: 0,
  isOpen: false,
  isLoading: false,
  isSending: false,
  _socketInitialized: false,

  setOpen: (open) => set({ isOpen: open }),

  setActiveConversation: (id) => {
    set({ activeConversationId: id });
    if (id) {
      get().loadMessages(id);
      get().markRead(id);
    }
  },

  initSocket: async () => {
    // ✅ Check cả connected lẫn initialized để tránh đăng ký handler nhiều lần
    if (chatSocket.isConnected() || get()._socketInitialized) return;

    set({ _socketInitialized: true });
    console.log('[ChatStore] initSocket called');

    try {
      const { useAuthStore } = await import('@/stores/authStore');
      const token = useAuthStore.getState().accessToken;
      if (!token) {
        set({ _socketInitialized: false });
        return;
      }

      chatSocket.connect(token);

      // ✅ Chỉ đăng ký handler 1 lần
      chatSocket.onMessage((msg) => {
        get().appendMessage(msg);
      });

      chatSocket.onAssigned((conversationId) => {
        console.log('[ChatStore] Admin assigned:', conversationId);
        get().loadConversations();
      });

    } catch (e) {
      set({ _socketInitialized: false });
      console.error('[ChatStore] initSocket error:', e);
    }
  },

  disconnectSocket: () => {
    chatSocket.disconnect();
    set({ _socketInitialized: false });
  },

  createSupportConversation: async () => {
    try {
      const conv = await chatApi.createSupportConversation();
      const exists = get().conversations.find((c) => c.id === conv.id);
      if (!exists) get().addConversation(conv);
      return conv;
    } catch (e) {
      console.error('[ChatStore] createSupportConversation error:', e);
      return null;
    }
  },

  loadConversations: async () => {
    set({ isLoading: true });
    try {
      const convs = await chatApi.getConversations();
      const unread = convs.reduce((s, c) => s + (c.unreadCount ?? 0), 0);
      set({ conversations: convs, unreadCount: unread });
    } catch (e) {
      console.error('[ChatStore] loadConversations error:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  loadMessages: async (conversationId) => {
    if (get().messages[conversationId]) return;
    try {
      const page = await chatApi.getMessages(conversationId);
      const sorted = [...(page.data ?? [])].map((raw: any) => ({
        id: raw.id,
        conversationId: raw.conversationId ?? conversationId,
        senderId: raw.senderId ?? '',
        senderUsername: raw.username,
        content: raw.message,
        type: raw.messageType ?? 'TEXT',
        createdAt: raw.createdAt,
        isMine: raw.me,
        fileIds: raw.fileIds,
      } as ChatMessage));
      set((s) => ({ messages: { ...s.messages, [conversationId]: sorted } }));
    } catch (e) {
      console.error('[ChatStore] loadMessages error:', e);
    }
  },

  appendMessage: (msg) => {
    set((s) => {
      const convId = msg.conversationId;
      const existing = s.messages[convId] ?? [];

      // ✅ Tránh duplicate message
      const isDuplicate = existing.some((m) => m.id === msg.id);
      if (isDuplicate) return s;

      const updated = [...existing, msg];
      const convs = s.conversations.map((c) =>
        c.id === convId ? { ...c, lastMessageContent: msg.content } : c
      );
      const isActive = s.activeConversationId === convId;
      const unreadDelta = !msg.isMine && !isActive ? 1 : 0;

      return {
        messages: { ...s.messages, [convId]: updated },
        conversations: convs,
        unreadCount: s.unreadCount + unreadDelta,
      };
    });
  },

  addConversation: (conv) => {
    set((s) => ({ conversations: [conv, ...s.conversations] }));
  },

  markRead: (conversationId) => {
    set((s) => {
      const conv = s.conversations.find((c) => c.id === conversationId);
      if (!conv || !conv.unreadCount) return s;
      const unreadDelta = conv.unreadCount ?? 0;
      const convs = s.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      );
      chatApi.markAsRead(conversationId).catch(() => {});
      return { conversations: convs, unreadCount: Math.max(0, s.unreadCount - unreadDelta) };
    });
  },

  setSending: (v) => set({ isSending: v }),
}));