'use client';

import { useState } from 'react';
import { Tag, CheckCircle, X } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

// Phase 1-2: mock coupon codes
const MOCK_COUPONS: Record<string, number> = {
  SHOPNOW10: 10,
  WELCOME20: 20,
  SAVE15: 15,
};

interface CouponInputProps {
  onApply: (discount: number, code: string) => void;
  onRemove: () => void;
  appliedCode?: string;
}

const CouponInput = ({ onApply, onRemove, appliedCode }: CouponInputProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const discount = MOCK_COUPONS[code.trim().toUpperCase()];
    if (discount) {
      onApply(discount, code.trim().toUpperCase());
      toast.success(`Áp dụng mã "${code.toUpperCase()}" thành công! Giảm ${discount}%`);
      setCode('');
    } else {
      toast.error('Mã giảm giá không hợp lệ hoặc đã hết hạn');
    }
    setLoading(false);
  };

  if (appliedCode) {
    const discount = MOCK_COUPONS[appliedCode] ?? 0;
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm font-semibold text-green-700">{appliedCode}</span>
          <span className="text-sm text-green-600">— Giảm {discount}%</span>
        </div>
        <button
          onClick={onRemove}
          className="text-green-500 hover:text-green-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-gray" />
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          placeholder="Nhập mã giảm giá..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                     placeholder:text-light-gray text-navy bg-white transition-colors"
        />
      </div>
      <button
        onClick={handleApply}
        disabled={!code.trim() || loading}
        className="px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-xl
                   hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
      >
        {loading ? '...' : 'Áp dụng'}
      </button>
    </div>
  );
};

export default CouponInput;
