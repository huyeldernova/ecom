// src/components/chat/ChatProvider.tsx
'use client';

import { useChatInit } from '@/hooks/useChatInit';
import ChatBubble from './ChatBubble';
import ChatDrawer from './ChatDrawer';

export default function ChatProvider() {
  useChatInit();

  return (
    <>
      <ChatBubble />
      <ChatDrawer />
    </>
  );
}