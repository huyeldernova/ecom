// src/components/chat/ConversationList.tsx
'use client';

import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { Conversation } from '@/types/chat.types';
import { cn, formatRelativeTime } from '@/lib/utils';

const getConvName = (conv: Conversation, myId?: string) => {
  if (conv.conversationName) return conv.conversationName;

  const parts = conv.participants ?? conv.participantInfo ?? [];
  if (!parts.length) return 'Cuộc trò chuyện';

  const other = parts.find((p) => p.userId !== myId);
  return other?.username ?? 'Cuộc trò chuyện';
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const AV_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-primary/10 text-primary',
];

interface Props {
  search: string;
}

const ConversationList = ({ search }: Props) => {
  const { conversations, activeConversationId, setActiveConversation, isLoading } =
    useChatStore();
  const { user } = useAuthStore();

  const filtered = conversations.filter((c) => {
    const name = getConvName(c, user?.id);
    return name.toLowerCase().includes(search.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="flex-1 p-3 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 p-2 animate-pulse">
            <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-2/3" />
              <div className="h-2.5 bg-gray-100 rounded w-4/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-center">
        <p className="text-xs text-mid-gray">
          {search ? 'Không tìm thấy kết quả' : 'Chưa có cuộc trò chuyện nào'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {filtered.map((conv, i) => {
        const name = getConvName(conv, user?.id);
        const isActive = conv.id === activeConversationId;
        const colorCls = AV_COLORS[i % AV_COLORS.length];
        const hasUnread = (conv.unreadCount ?? 0) > 0;

        return (
          <button
            key={conv.id}
            onClick={() => setActiveConversation(conv.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
              'border-l-[3px] border-b border-b-border/50',
              isActive
                ? 'bg-primary/5 border-l-primary'
                : 'border-l-transparent hover:bg-gray-50'
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                colorCls
              )}
            >
              {getInitials(name)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span
                  className={cn(
                    'text-xs truncate',
                    hasUnread ? 'font-bold text-navy' : 'font-medium text-navy'
                  )}
                >
                  {name}
                </span>
                {conv.updatedAt && (
                  <span className="text-[10px] text-light-gray shrink-0">
                    {formatRelativeTime(conv.updatedAt)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-mid-gray truncate flex-1">
                  {conv.lastMessageContent ?? '...'}
                </span>
                {(conv.unreadCount ?? 0) > 0 && (
                  <span className="min-w-[16px] h-4 px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ConversationList;