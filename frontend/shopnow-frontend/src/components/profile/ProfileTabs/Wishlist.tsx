// ─── Wishlist.tsx ──────────────────────────────────────────
'use client';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { MOCK_PRODUCTS } from '@/lib/mockData/products.mock';
import { formatPrice } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { useCartStore } from '@/stores/cartStore';
import { CartItem } from '@/types/cart.types';

const Wishlist = () => {
  const addItem = useCartStore((s) => s.addItem);
  // Phase 2: wishlist stored in localStorage (simplified mock with first 3 products)
  const wishlistItems = MOCK_PRODUCTS.slice(0, 3);

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

  if (wishlistItems.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="w-12 h-12 mx-auto mb-3 text-gray-200" />
        <p className="text-mid-gray font-medium">Danh sách yêu thích trống</p>
        <Link href="/products" className="text-primary text-sm hover:underline mt-1 inline-block">
          Khám phá sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-head font-bold text-xl text-navy">Yêu thích</h2>
        <p className="text-mid-gray text-sm mt-1">{wishlistItems.length} sản phẩm</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {wishlistItems.map((product) => {
          const v = product.variants[0];
          const price = v.discountPrice ?? v.price;
          return (
            <div key={product.id} className="bg-white rounded-2xl border border-border overflow-hidden group">
              <div className="relative aspect-video bg-background overflow-hidden">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <button className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-red-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-3">
                <Link href={`/products/${product.id}`}>
                  <p className="font-semibold text-navy text-sm line-clamp-2 hover:text-primary transition-colors">{product.name}</p>
                </Link>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-navy">{formatPrice(price)}</span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex items-center gap-1.5 text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> Thêm vào giỏ
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { Wishlist };
