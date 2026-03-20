'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { StarRatingInput } from '@/components/ui/StarRating';
import { toast } from '@/components/ui/Toast';

interface ReviewModalProps {
  productName: string;
  onClose: () => void;
}

const ReviewModal = ({ productName, onClose }: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Vui lòng chọn số sao'); return; }
    if (comment.trim().length < 10) { toast.error('Nhận xét tối thiểu 10 ký tự'); return; }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success('Đã gửi đánh giá! Cảm ơn bạn 🎉');
    setSubmitting(false);
    onClose();
  };

  const STAR_LABELS = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Xuất sắc'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="modal-overlay absolute inset-0" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-head font-bold text-navy">Viết đánh giá</h2>
            <p className="text-sm text-mid-gray mt-0.5 truncate max-w-xs">{productName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-light-gray hover:text-navy hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star rating */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-navy">Đánh giá của bạn *</label>
            <div className="flex flex-col items-center gap-2 py-3 bg-gray-50 rounded-xl">
              <StarRatingInput value={rating} onChange={setRating} />
              {rating > 0 && (
                <p className="text-sm font-medium text-navy">{STAR_LABELS[rating]}</p>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-navy">Nhận xét *</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              className="w-full px-4 py-3 rounded-xl border border-border text-sm text-navy
                         placeholder:text-light-gray bg-white resize-none
                         focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            <p className="text-xs text-light-gray text-right">{comment.length}/500</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || rating === 0}
            className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold
                       rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
