// src/components/chat/NewConversationModal.tsx
'use client';

import { useState } from 'react';
import { X, Loader2, Users, MessageCircle, Headphones } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { chatApi } from '@/services/chatService';
import { ConversationType } from '@/types/chat.types';
import { toast } from '@/components/ui/Toast';

interface Props {
  onClose: () => void;
}

type TabType = 'PRIVATE' | 'GROUP' | 'SUPPORT';

const NewConversationModal = ({ onClose }: Props) => {
  const { user } = useAuthStore();
  const { addConversation, setActiveConversation, conversations } = useChatStore();

  const [tab, setTab] = useState<TabType>('PRIVATE');
  const [name, setName] = useState('');
  const [participantId, setParticipantId] = useState('');
  const [participantUsername, setParticipantUsername] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Tạo PRIVATE hoặc GROUP conversation ──────────────────
  const handleCreate = async () => {
    if (!user) return;
    if (!participantId.trim() || !participantUsername.trim()) {
      toast.error('Vui lòng nhập thông tin người nhận');
      return;
    }

    setLoading(true);
    try {
      const participants: Record<string, string> = {
        [user.id]: user.firstName || user.email,
        [participantId.trim()]: participantUsername.trim(),
      };

      const conv = await chatApi.createConversation({
        conversationType: tab as ConversationType,
        conversationName: tab === 'GROUP' ? name : undefined,
        participants,
      });

      addConversation(conv);
      setActiveConversation(conv.id);
      onClose();
      toast.success('Tạo cuộc trò chuyện thành công');
    } catch {
      toast.error('Không thể tạo cuộc trò chuyện');
    } finally {
      setLoading(false);
    }
  };

  // ── Tạo SUPPORT conversation ──────────────────────────────
  const handleSupportChat = async () => {
    setLoading(true);
    try {
      const conv = await chatApi.createSupportConversation();

      // Thêm vào list nếu chưa có
      const exists = conversations.find((c) => c.id === conv.id);
      if (!exists) addConversation(conv);

      setActiveConversation(conv.id);
      onClose();
      toast.success(
        conv.status === 'ACTIVE'
          ? 'Đã kết nối với hỗ trợ viên!'
          : 'Đang chờ hỗ trợ viên, chúng tôi sẽ phản hồi sớm nhất!'
      );
    } catch {
      toast.error('Không thể tạo cuộc trò chuyện hỗ trợ');
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full px-3 py-2.5 rounded-xl border border-border text-sm text-navy ' +
    'placeholder:text-light-gray focus:outline-none focus:ring-2 focus:ring-primary/20 ' +
    'focus:border-primary bg-white transition-colors';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10 animate-scale-in">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-head font-bold text-navy">Cuộc trò chuyện mới</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-light-gray hover:text-navy hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex gap-2 mb-4">
          {[
            { v: 'PRIVATE' as TabType, icon: <MessageCircle className="w-4 h-4" />, label: 'Trực tiếp' },
            { v: 'GROUP'   as TabType, icon: <Users          className="w-4 h-4" />, label: 'Nhóm' },
            { v: 'SUPPORT' as TabType, icon: <Headphones     className="w-4 h-4" />, label: 'Hỗ trợ' },
          ].map(({ v, icon, label }) => (
            <button
              key={v}
              onClick={() => setTab(v)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-medium transition-colors ${
                tab === v
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-mid-gray hover:bg-gray-50'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab: SUPPORT ── */}
        {tab === 'SUPPORT' && (
          <div className="space-y-4">
            <div className="bg-primary/5 rounded-xl p-4 text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-2xl">
                🎧
              </div>
              <p className="font-semibold text-navy text-sm">Chat với hỗ trợ viên</p>
              <p className="text-xs text-mid-gray">
                Hệ thống sẽ tự động kết nối bạn với hỗ trợ viên đang online.
                Nếu không có ai, yêu cầu sẽ được xử lý sớm nhất có thể.
              </p>
            </div>

            <button
              onClick={handleSupportChat}
              disabled={loading}
              className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white
                         font-semibold rounded-xl transition-colors disabled:opacity-60
                         flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Đang kết nối...' : '🎧 Bắt đầu chat hỗ trợ'}
            </button>
          </div>
        )}

        {/* ── Tab: PRIVATE hoặc GROUP ── */}
        {tab !== 'SUPPORT' && (
          <div className="space-y-3">
            {tab === 'GROUP' && (
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Tên nhóm *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Nhóm mua hàng"
                  className={inputCls}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">
                {tab === 'PRIVATE' ? 'User ID người nhận *' : 'User ID thành viên *'}
              </label>
              <input
                value={participantId}
                onChange={(e) => setParticipantId(e.target.value)}
                placeholder="UUID của người dùng"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Username người nhận *</label>
              <input
                value={participantUsername}
                onChange={(e) => setParticipantUsername(e.target.value)}
                placeholder="Username"
                className={inputCls}
              />
            </div>

            <p className="text-xs text-light-gray bg-gray-50 rounded-lg p-3">
              💡 Trong thực tế, bạn sẽ tích hợp search user từ UserService/ProfileService thay vì nhập tay.
            </p>

            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full mt-2 py-2.5 bg-primary hover:bg-primary-dark text-white
                         font-semibold rounded-xl transition-colors disabled:opacity-60
                         flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Đang tạo...' : 'Tạo cuộc trò chuyện'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewConversationModal;