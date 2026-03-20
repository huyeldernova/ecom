'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface CartSummaryProps {
  subtotal: number;
  discount: number;        // percentage 0-100
  discountCode?: string;
}

const SHIPPING_THRESHOLD = 50;

const CartSummary = ({ subtotal, discount, discountCode }: CartSummaryProps) => {
  const discountAmount = discount > 0 ? Math.round(subtotal * (discount / 100)) : 0;
  const afterDiscount = subtotal - discountAmount;
  const shipping = afterDiscount >= SHIPPING_THRESHOLD ? 0 : 9.99;
  const total = afterDiscount + shipping;
  const freeShippingRemaining = SHIPPING_THRESHOLD - afterDiscount;

  return (
    <div className="bg-white rounded-2xl border border-border p-6 space-y-4 sticky top-24">
      <h2 className="font-head font-bold text-lg text-navy">Tóm tắt đơn hàng</h2>

      {/* Free shipping progress */}
      {freeShippingRemaining > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm">
          <p className="text-amber-700 font-medium">
            🚚 Thêm <span className="font-bold">{formatPrice(freeShippingRemaining)}</span> để được miễn phí vận chuyển!
          </p>
          <div className="mt-2 h-1.5 bg-amber-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${Math.min((afterDiscount / SHIPPING_THRESHOLD) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
      {shipping === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 font-medium">
          🎉 Bạn được miễn phí vận chuyển!
        </div>
      )}

      {/* Line items */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-mid-gray">
          <span>Tạm tính</span>
          <span className="text-navy font-medium">{formatPrice(subtotal)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Giảm giá {discountCode && `(${discountCode})`}</span>
            <span className="font-medium">-{formatPrice(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-mid-gray">
          <span>Phí vận chuyển</span>
          <span className={shipping === 0 ? 'text-green-600 font-medium' : 'text-navy font-medium'}>
            {shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
          </span>
        </div>

        <div className="border-t border-border pt-3 flex justify-between font-bold text-navy text-base">
          <span>Tổng cộng</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {/* Checkout */}
      <Link
        href="/checkout"
        className="flex items-center justify-center gap-2 w-full py-3
                   bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl
                   transition-colors shadow-md shadow-primary/20"
      >
        Tiến hành thanh toán
        <ArrowRight className="w-4 h-4" />
      </Link>

      {/* Continue shopping */}
      <Link
        href="/products"
        className="block text-center text-sm text-mid-gray hover:text-primary transition-colors"
      >
        ← Tiếp tục mua sắm
      </Link>

      {/* Trust */}
      <div className="flex items-center justify-center gap-2 text-xs text-light-gray pt-2 border-t border-border">
        <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
        Thanh toán an toàn & bảo mật
      </div>
    </div>
  );
};

export default CartSummary;
