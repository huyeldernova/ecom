// src/services/chatService.ts

import { Client, StompSubscription } from '@stomp/stompjs';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import {
  ChatMessage,
  Conversation,
  CreateConversationRequest,
  OnlineStatus,
  PageResponse,
  SendMessagePayload,
} from '@/types/chat.types';

// ─── HTTP client ───────────────────────────────────────────
const chatHttp = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CHAT_SERVICE_URL ?? 'http://localhost:9191/chat-service',
  timeout: 10_000,
});

chatHttp.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── REST API ──────────────────────────────────────────────
export const chatApi = {

  getConversations: async (): Promise<Conversation[]> => {
    const res = await chatHttp.get('/api/v1/conversations/my-conversation');
    return res.data.data?.data ?? [];
  },

  createConversation: async (req: CreateConversationRequest): Promise<Conversation> => {
    const res = await chatHttp.post('/api/v1/conversations', req);
    return res.data.data;
  },

  createSupportConversation: async (): Promise<Conversation> => {
    const res = await chatHttp.post('/api/v1/conversations/support');
    return res.data.data;
  },

  getMessages: async (
    conversationId: string,
    page = 1,
    size = 30
  ): Promise<PageResponse<ChatMessage>> => {
    const res = await chatHttp.get(
      `/api/v1/conversations/${conversationId}/messages`,
      { params: { page, size } }
    );
    return res.data.data;
  },

  markAsRead: async (conversationId: string): Promise<void> => {
    await chatHttp.post(`/api/v1/conversations/${conversationId}/read`);
  },

  getOnlineStatus: async (userId: string): Promise<OnlineStatus> => {
    const res = await chatHttp.get(`/api/v1/users/${userId}/online-status`);
    return res.data.data;
  },
};

// ─── WebSocket STOMP service ────────────────────────────────
class ChatSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private messageHandlers: Set<(msg: ChatMessage) => void> = new Set();
  private assignedHandlers: Set<(conversationId: string) => void> = new Set();
  private connected = false;
  private connecting = false;  // ✅ thêm flag này

  connect(token: string) {
    if (this.connected || this.connecting) return;  // ✅ check cả 2
    this.connecting = true;  // ✅ đánh dấu đang connect

    const wsUrl =
      process.env.NEXT_PUBLIC_CHAT_WS_URL ?? 'ws://localhost:9191/chat-service/ws';

    this.client = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        this.connected = true;
        this.connecting = false;  // ✅ reset flag
        this._subscribeToPersonalQueue();
      },

      onDisconnect: () => {
        this.connected = false;
        this.connecting = false;  // ✅ reset flag
      },

      onStompError: (frame) => {
        this.connecting = false;  // ✅ reset flag khi lỗi
        console.error('[ChatSocket] STOMP error:', frame);
      },
    });

    this.client.activate();
  }


  disconnect() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.clear();
    this.client?.deactivate();
    this.connected = false;
    this.connecting = false;  // ✅ reset flag
  }




  private _subscribeToPersonalQueue() {
    if (!this.client) return;

    console.log('[ChatSocket] Subscribing to personal queue...');

    // ✅ Đổi /queue/messages → /queue/chat
    const msgSub = this.client.subscribe('/user/queue/chat', (frame) => {
      console.log('[ChatSocket] Raw message:', frame.body);
      try {
        const raw = JSON.parse(frame.body);

        // ✅ Map field names từ backend → FE types
        const msg: ChatMessage = {
          id: raw.id,
          conversationId: raw.conversationId,
          senderId: raw.senderId ?? '',
          senderUsername: raw.username,       // ✅ username → senderUsername
          content: raw.message,              // ✅ message → content
          type: raw.messageType ?? 'TEXT',   // ✅ messageType → type
          createdAt: raw.createdAt,
          isMine: raw.me,                    // ✅ me → isMine
          fileIds: raw.fileIds,
        };

        this.messageHandlers.forEach((h) => h(msg));
      } catch (e) {
        console.error('[ChatSocket] Parse error:', e);
      }
    });
    this.subscriptions.set('personal', msgSub);

    // Admin nhận notification khi được assign ticket
    const assignedSub = this.client.subscribe('/user/queue/assigned', (frame) => {
      try {
        const conversationId: string = JSON.parse(frame.body);
        this.assignedHandlers.forEach((h) => h(conversationId));
      } catch (e) {
        console.error('[ChatSocket] Assigned parse error:', e);
      }
    });
    this.subscriptions.set('assigned', assignedSub);
  }

  sendMessage(payload: SendMessagePayload) {
    if (!this.client?.connected) {
      console.warn('[ChatSocket] Not connected, cannot send message');
      return;
    }
    this.client.publish({
      destination: '/app/chat',
      body: JSON.stringify({
        conversationId: payload.conversationId,
        message: payload.content,        // ✅ content → message
        messageType: payload.type,       // ✅ type → messageType
        fileIds: payload.fileIds ?? [],
      }),
    });
  }

  sendTyping(conversationId: string) {
    if (!this.client?.connected) return;
    this.client.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify({ conversationId }),
    });
  }

  onMessage(handler: (msg: ChatMessage) => void): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onAssigned(handler: (conversationId: string) => void): () => void {
    this.assignedHandlers.add(handler);
    return () => this.assignedHandlers.delete(handler);
  }

  isConnected() {
    return this.connected;
  }
}

export const chatSocket = new ChatSocketService();``