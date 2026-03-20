'use client';

import Link from 'next/link';
import { ShoppingCart, Heart, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import { toast } from '@/components/ui/Toast';
import { formatPrice } from '@/lib/utils';
import { MOCK_PRODUCTS } from '@/lib/mockData/products.mock';
import { Product } from '@/types/product.types';
import { CartItem } from '@/types/cart.types';

// ─── Product Card ─────────────────────────────────────────
const ProductCard = ({ product }: { product: Product }) => {
  const addItem = useCartStore((s) => s.addItem);
  const openCartDrawer = useUIStore((s) => s.openCartDrawer);

  const defaultVariant = product.variants[0];
  const price = defaultVariant.discountPrice ?? defaultVariant.price;
  const hasDiscount = !!defaultVariant.discountPrice;
  const discountPct = hasDiscount
    ? Math.round((1 - defaultVariant.discountPrice! / defaultVariant.price) * 100)
    : 0;

  const handleAddToCart = () => {
    const item: CartItem = {
      id: `${product.id}-${defaultVariant.id}-${Date.now()}`,
      productId: product.id,
      productVariantId: defaultVariant.id,
      productName: product.name,
      variantName: defaultVariant.variantName,
      imageUrl: product.imageUrl,
      quantity: 1,
      snapshotPrice: price,
    };
    addItem(item);
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng`);
    openCartDrawer();
  };

  return (
    <div className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <div className="relative overflow-hidden bg-background aspect-square">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-lg">
            -{discountPct}%
          </span>
        )}
        {/* Wishlist */}
        <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center
                           shadow-md opacity-0 group-hover:opacity-100 transition-opacity
                           hover:text-primary text-light-gray">
          <Heart className="w-4 h-4" />
        </button>
        {/* Quick add overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            className="w-full py-2 bg-navy text-white text-sm font-semibold rounded-xl
                       hover:bg-primary transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" /> Thêm vào giỏ
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-primary font-medium mb-1">{product.category}</p>
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-navy text-sm leading-snug line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price + variants */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-navy">{formatPrice(price)}</span>
            {hasDiscount && (
              <span className="text-xs text-light-gray line-through">
                {formatPrice(defaultVariant.price)}
              </span>
            )}
          </div>
          <span className="text-xs text-light-gray">
            {product.variants.length} variants
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Featured Products Section ────────────────────────────
const FeaturedProducts = () => {
  // Lấy 8 sản phẩm đầu từ mock
  const featured = MOCK_PRODUCTS.slice(0, 8);

  return (
    <section className="bg-white py-14">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-1">
              Nổi bật
            </p>
            <h2 className="font-head font-bold text-2xl text-navy">
              Sản phẩm được yêu thích
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
          >
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile view all */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 border border-primary text-primary font-semibold rounded-xl hover:bg-primary hover:text-white transition-colors"
          >
            Xem tất cả sản phẩm <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
