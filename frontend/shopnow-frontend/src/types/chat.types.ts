// src/types/chat.types.ts

export type ConversationType = 'PRIVATE' | 'GROUP' | 'SUPPORT';
export type ConversationStatus = 'PENDING' | 'ACTIVE' | 'CLOSED';
export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';

export interface ChatParticipant {
  userId: string;
  username: string;
  me?: boolean;
  joinedAt?: string;
}

export interface Conversation {
  id: string;
  conversationName?: string;    // ✅ đổi name → conversationName (match backend)
  conversationType: ConversationType;  // ✅ đổi type → conversationType
  conversationAvatar?: string;
  status?: ConversationStatus;  // ✅ thêm
  participants?: ChatParticipant[];
  participantInfo?: ChatParticipant[];
  lastMessageContent?: string;  // ✅ match backend field name
  lastMessageTime?: string;
  unreadCount?: number;
  createdAt: string;
}

export interface SystemMessage {
  type: 'SYSTEM';
  content: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderUsername: string;
  content: string;
  type: MessageType;
  fileIds?: string[];
  createdAt: string;
  isMine?: boolean; // computed on client
}

export interface SendMessagePayload {
  conversationId: string;
  content: string;
  type: MessageType;
  fileIds?: string[];
}

export interface CreateConversationRequest {
  name?: string;
  type: ConversationType;
  participants: Record<string, string>;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface OnlineStatus {
  userId: string;
  online: boolean;
}