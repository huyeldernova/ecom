// src/components/chat/MessageThread.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Paperclip, Send, Smile, FileText, Image } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { chatSocket } from '@/services/chatService';
import { ChatMessage } from '@/types/chat.types';
import { cn } from '@/lib/utils';

// ─── Single bubble ────────────────────────────────────────
const Bubble = ({ msg, showName }: { msg: ChatMessage; showName: boolean }) => {
  const mine = msg.isMine;

  if (msg.type === 'SYSTEM') {
    return (
      <div className="flex justify-center my-1">
        <span className="text-[11px] text-mid-gray bg-gray-100 px-3 py-1 rounded-full">
          {msg.content}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-end gap-2', mine && 'flex-row-reverse')}>
      {!mine && (
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center
                        text-[10px] font-bold text-primary shrink-0 mb-1">
          {msg.senderUsername?.[0]?.toUpperCase()}
        </div>
      )}

      <div className={cn('flex flex-col gap-0.5', mine && 'items-end', 'max-w-[68%]')}>
        {!mine && showName && (
          <span className="text-[11px] text-mid-gray ml-1">{msg.senderUsername}</span>
        )}

        <div className={cn(
          'px-3 py-2 text-xs leading-relaxed',
          mine
            ? 'bg-primary text-white rounded-2xl rounded-br-[4px]'
            : 'bg-gray-100 text-navy rounded-2xl rounded-bl-[4px]'
        )}>
          {msg.type === 'FILE' ? (
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>{msg.content}</span>
            </div>
          ) : msg.type === 'IMAGE' ? (
            <div className="flex items-center gap-2">
              <Image className="w-3.5 h-3.5 shrink-0" />
              <span>{msg.content}</span>
            </div>
          ) : (
            msg.content
          )}
        </div>

        <span className="text-[10px] text-light-gray px-1">
          {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
};

// ─── Typing indicator ─────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex items-end gap-2">
    <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0" />
    <div className="flex gap-1 px-3 py-2.5 bg-gray-100 rounded-2xl rounded-bl-[4px]">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-mid-gray animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  </div>
);

// ─── Date separator ───────────────────────────────────────
const DateSep = ({ date }: { date: string }) => (
  <div className="flex items-center gap-2 my-2">
    <div className="flex-1 h-px bg-border" />
    <span className="text-[11px] text-light-gray whitespace-nowrap">
      {new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })}
    </span>
    <div className="flex-1 h-px bg-border" />
  </div>
);

// ─── Main thread ──────────────────────────────────────────
interface Props {
  conversationId: string;
}

const MessageThread = ({ conversationId }: Props) => {
  const { messages, conversations, setSending } = useChatStore();
  const { accessToken } = useAuthStore(); // ✅ lấy accessToken trực tiếp

  const msgs = messages[conversationId] ?? [];
  const conv = conversations.find((c) => c.id === conversationId);

  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs.length]);

  // ── Gửi text ──────────────────────────────────────────
  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    setInput('');
    setSending(true);

    chatSocket.sendMessage({
      conversationId,
      content: text,
      type: 'TEXT',
    });

    setSending(false);
  }, [input, conversationId]);

  // ── Upload file ───────────────────────────────────────
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('files', file));

      // ✅ Dùng accessToken từ closure của component
      const res = await fetch('http://localhost:9191/file/api/v1/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);

      const data = await res.json();
      const fileIds: string[] = data.data.map((f: any) => f.id);

      const isImage = Array.from(files).every((f) => f.type.startsWith('image/'));

      chatSocket.sendMessage({
        conversationId,
        content: isImage
          ? `🖼️ ${files.length} ảnh`
          : `📎 ${Array.from(files).map((f) => f.name).join(', ')}`,
        type: isImage ? 'IMAGE' : 'FILE',
        fileIds,
      });

    } catch (err) {
      console.error('[MessageThread] Upload error:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [conversationId, accessToken]); // ✅ thêm accessToken vào deps

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    chatSocket.sendTyping(conversationId);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {}, 2000);
  };

  // Group by date
  const grouped: Array<{ date: string; messages: ChatMessage[] }> = [];
  msgs.forEach((msg) => {
    const d = msg.createdAt.slice(0, 10);
    const last = grouped[grouped.length - 1];
    if (last?.date === d) {
      last.messages.push(msg);
    } else {
      grouped.push({ date: d, messages: [msg] });
    }
  });

  const convName = conv?.conversationName ?? 'Cuộc trò chuyện';

  return (
    <>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center
                        text-xs font-bold text-primary">
          {convName[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-xs font-semibold text-navy">{convName}</p>
          <p className="text-[11px] text-mid-gray">
            {(conv?.participants ?? conv?.participantInfo ?? []).length} thành viên
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {grouped.map(({ date, messages: dayMsgs }) => (
          <div key={date}>
            <DateSep date={date} />
            <div className="space-y-2">
              {dayMsgs.map((msg, i) => {
                const prev = i > 0 ? dayMsgs[i - 1] : null;
                const showName = !msg.isMine && prev?.senderId !== msg.senderId;
                return <Bubble key={msg.id} msg={msg} showName={showName} />;
              })}
            </div>
          </div>
        ))}

        {msgs.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <p className="text-2xl mb-2">💬</p>
            <p className="text-xs text-mid-gray">Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-3 py-2.5 border-t border-border flex items-center gap-2">

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
        />

        {/* Paperclip button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-8 h-8 rounded-lg flex items-center justify-center
                     text-mid-gray hover:bg-gray-100 transition-colors disabled:opacity-40"
        >
          {isUploading
            ? <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            : <Paperclip className="w-4 h-4" />
          }
        </button>

        <button className="w-8 h-8 rounded-lg flex items-center justify-center
                           text-mid-gray hover:bg-gray-100 transition-colors">
          <Smile className="w-4 h-4" />
        </button>

        <input
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn..."
          className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-xs
                     text-navy placeholder:text-light-gray focus:outline-none
                     focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />

        <button
          onClick={handleSend}
          disabled={!input.trim() || isUploading}
          className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center
                     hover:bg-primary-dark transition-colors disabled:opacity-40 shrink-0"
        >
          <Send className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </>
  );
};

export default MessageThread;