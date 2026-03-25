'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useCartStore } from '@/stores/cartStore';
import { MOCK_PRODUCTS } from '@/lib/mockData/products.mock';
import { formatPrice } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { CartItem } from '@/types/cart.types';

const WishlistDrawer = () => {
  const { wishlistDrawerOpen, closeWishlistDrawer } = useUIStore();
  const addItem = useCartStore((s) => s.addItem);

  // Phase 2: mock wishlist with first 3 products
  const items = MOCK_PRODUCTS.slice(0, 3);

  useEffect(() => {
    document.body.style.overflow = wishlistDrawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [wishlistDrawerOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeWishlistDrawer();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeWishlistDrawer]);

  if (!wishlistDrawerOpen) return null;

  const handleAddToCart = (product: typeof MOCK_PRODUCTS[0]) => {
    const v = product.variants[0];
    const item: CartItem = {
      id: `${product.id}-${v.id}-${Date.now()}`,
      productId: product.id,
      productVariantId: v.id,
      productName: product.name,
      variantName: v.variantName,
      imageUrl: product.imageUrl,
      quantity: 1,
      snapshotPrice: v.discountPrice ?? v.price,
    };
    addItem(item);
    toast.success('Đã thêm vào giỏ hàng');
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50" onClick={closeWishlistDrawer} />

      <div className="w-full max-w-sm bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary" />
            <h2 className="font-head font-bold text-navy">
              Yêu thích
              <span className="ml-2 text-sm font-normal text-mid-gray">({items.length})</span>
            </h2>
          </div>
          <button
            onClick={closeWishlistDrawer}
            className="p-2 rounded-lg text-light-gray hover:text-navy hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-4xl">💝</div>
            <div>
              <p className="font-semibold text-navy">Danh sách yêu thích trống</p>
              <p className="text-sm text-mid-gray mt-1">Thêm sản phẩm yêu thích để xem lại sau</p>
            </div>
            <button
              onClick={closeWishlistDrawer}
              className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors"
            >
              Khám phá sản phẩm
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
            {items.map((product) => {
              const v = product.variants[0];
              const price = v.discountPrice ?? v.price;
              return (
                <div key={product.id} className="flex gap-3 py-3 border-b border-border last:border-0">
                  <Link href={`/products/${product.id}`} onClick={closeWishlistDrawer}>
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-background border border-border shrink-0">
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${product.id}`} onClick={closeWishlistDrawer}>
                      <p className="text-sm font-semibold text-navy hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                      </p>
                    </Link>
                    <p className="font-bold text-navy mt-1">{formatPrice(price)}</p>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex items-center gap-1.5 mt-2 text-xs bg-primary/10 text-primary
                                 px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors font-medium"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Thêm vào giỏ
                    </button>
                  </div>
                  <button className="p-1.5 text-light-gray hover:text-red-500 transition-colors self-start shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistDrawer;
