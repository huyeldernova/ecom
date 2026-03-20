'use client';

import Link from 'next/link';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import { toast } from '@/components/ui/Toast';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types/product.types';
import { CartItem } from '@/types/cart.types';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore((s) => s.addItem);
  const openCartDrawer = useUIStore((s) => s.openCartDrawer);

  if (!product.variants || product.variants.length === 0) return null;
  const defaultVariant = product.variants[0];
  const price = defaultVariant.discountPrice ?? defaultVariant.price;
  const hasDiscount = !!defaultVariant.discountPrice;
  const discountPct = hasDiscount
    ? Math.round((1 - defaultVariant.discountPrice! / defaultVariant.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
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
    toast.success(`Đã thêm vào giỏ hàng`);
    openCartDrawer();
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-background aspect-square">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-lg">
            -{discountPct}%
          </span>
        )}
        <button
          onClick={(e) => e.preventDefault()}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-md
                     flex items-center justify-center opacity-0 group-hover:opacity-100
                     transition-opacity hover:text-primary text-light-gray"
        >
          <Heart className="w-4 h-4" />
        </button>
        {/* Quick add */}
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
        <h3 className="font-semibold text-navy text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-navy">{formatPrice(price)}</span>
            {hasDiscount && (
              <span className="text-xs text-light-gray line-through">
                {formatPrice(defaultVariant.price)}
              </span>
            )}
          </div>
          <span className="text-xs text-light-gray">{product.variants.length} loại</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
