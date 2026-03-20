'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useCartStore } from '@/stores/cartStore';
import CartItem from '@/components/cart/CartItem';
import { formatPrice } from '@/lib/utils';

const CartDrawer = () => {
  const { cartDrawerOpen, closeCartDrawer } = useUIStore();
  const items = useCartStore((s) => s.items);
  const totalAmount = useCartStore((s) => s.totalAmount());
  const itemCount = useCartStore((s) => s.itemCount());

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = cartDrawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [cartDrawerOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCartDrawer();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeCartDrawer]);

  if (!cartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="modal-overlay flex-1" onClick={closeCartDrawer} />

      {/* Drawer */}
      <div className="w-full max-w-sm bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="font-head font-bold text-navy">
              Giỏ hàng
              {itemCount > 0 && (
                <span className="ml-2 text-sm font-normal text-mid-gray">
                  ({itemCount} sản phẩm)
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeCartDrawer}
            className="p-2 rounded-lg text-light-gray hover:text-navy hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          // Empty state
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-4xl">
              🛒
            </div>
            <div>
              <h3 className="font-semibold text-navy mb-1">Giỏ hàng trống</h3>
              <p className="text-sm text-mid-gray">Thêm sản phẩm vào giỏ để tiếp tục</p>
            </div>
            <button
              onClick={closeCartDrawer}
              className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors"
            >
              Khám phá sản phẩm
            </button>
          </div>
        ) : (
          <>
            {/* Cart items - scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-2">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-5 py-4 space-y-3 bg-white">
              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-mid-gray text-sm">Tổng cộng</span>
                <span className="font-bold text-xl text-navy">{formatPrice(totalAmount)}</span>
              </div>

              {/* Free shipping hint */}
              {totalAmount < 50 && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  🚚 Thêm {formatPrice(50 - totalAmount)} để được miễn phí vận chuyển
                </p>
              )}

              {/* Checkout button */}
              <Link
                href="/checkout"
                onClick={closeCartDrawer}
                className="flex items-center justify-center gap-2 w-full py-3
                           bg-primary hover:bg-primary-dark text-white font-semibold
                           rounded-xl transition-colors shadow-md shadow-primary/20"
              >
                Thanh toán ngay
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* View cart link */}
              <Link
                href="/cart"
                onClick={closeCartDrawer}
                className="block text-center text-sm text-mid-gray hover:text-primary transition-colors"
              >
                Xem giỏ hàng đầy đủ
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
