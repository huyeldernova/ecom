'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { CartItem as CartItemType } from '@/types/cart.types';
import { formatPrice } from '@/lib/utils';

interface CartItemProps {
  item: CartItemType;
}

const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex gap-4 py-4 border-b border-border last:border-0">
      {/* Image */}
      <Link href={`/products/${item.productId}`} className="shrink-0">
        <div className="w-20 h-20 rounded-xl bg-background overflow-hidden border border-border">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.productName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/products/${item.productId}`}>
          <h3 className="font-semibold text-navy text-sm leading-snug hover:text-primary transition-colors line-clamp-2">
            {item.productName}
          </h3>
        </Link>
        <p className="text-xs text-mid-gray mt-0.5">{item.variantName}</p>

        <div className="flex items-center justify-between mt-3">
          {/* Quantity stepper */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center text-mid-gray hover:bg-gray-50 hover:text-navy transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-9 text-center text-sm font-semibold text-navy">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-mid-gray hover:bg-gray-50 hover:text-navy transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Price + remove */}
          <div className="flex items-center gap-3">
            <span className="font-bold text-navy">
              {formatPrice(item.snapshotPrice * item.quantity)}
            </span>
            <button
              onClick={() => removeItem(item.id)}
              className="p-1.5 rounded-lg text-light-gray hover:text-red-500 hover:bg-red-50 transition-colors"
              aria-label="Xóa sản phẩm"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
