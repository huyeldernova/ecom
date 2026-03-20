'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import CouponInput from '@/components/cart/CouponInput';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.totalAmount());
  const clearCart = useCartStore((s) => s.clearCart);

  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState('');

  const handleApplyCoupon = (discount: number, code: string) => {
    setCouponDiscount(discount);
    setCouponCode(code);
  };

  const handleRemoveCoupon = () => {
    setCouponDiscount(0);
    setCouponCode('');
  };

  // ─── Empty cart ───────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center text-center gap-5">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-5xl">
          🛒
        </div>
        <div>
          <h1 className="font-head font-bold text-2xl text-navy mb-2">
            Giỏ hàng của bạn đang trống
          </h1>
          <p className="text-mid-gray max-w-sm">
            Hãy khám phá hàng nghìn sản phẩm hấp dẫn và thêm vào giỏ hàng nhé!
          </p>
        </div>
        <Link
          href="/products"
          className="px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-md shadow-primary/20"
        >
          Mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-6 h-6 text-primary" />
          <h1 className="font-head font-bold text-2xl text-navy">
            Giỏ hàng của tôi
          </h1>
          <span className="text-mid-gray text-sm">
            ({items.length} sản phẩm)
          </span>
        </div>
        <button
          onClick={clearCart}
          className="flex items-center gap-1.5 text-sm text-mid-gray hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Xóa tất cả
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items — left */}
        <div className="lg:col-span-2 space-y-4">
          {/* Items list */}
          <div className="bg-white rounded-2xl border border-border px-5 py-2">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          {/* Coupon */}
          <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
            <h3 className="font-semibold text-navy text-sm flex items-center gap-2">
              🏷️ Mã giảm giá
            </h3>
            <CouponInput
              onApply={handleApplyCoupon}
              onRemove={handleRemoveCoupon}
              appliedCode={couponCode}
            />
            <p className="text-xs text-light-gray">
              Thử: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-mid-gray">SHOPNOW10</span>,{' '}
              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-mid-gray">WELCOME20</span>,{' '}
              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-mid-gray">SAVE15</span>
            </p>
          </div>
        </div>

        {/* Summary — right */}
        <div className="lg:col-span-1">
          <CartSummary
            subtotal={subtotal}
            discount={couponDiscount}
            discountCode={couponCode}
          />
        </div>
      </div>
    </div>
  );
}
