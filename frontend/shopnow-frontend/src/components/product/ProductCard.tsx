'use client';

import Link from 'next/link';
import { ShoppingCart, Heart } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { toast } from '@/components/ui/Toast';
import { formatPrice } from '@/lib/utils';
import { ProductSummary } from '@/types/product.types';  // ✅ đổi sang ProductSummary

interface ProductCardProps {
  product: ProductSummary;  // ✅
}

const ProductCard = ({ product }: ProductCardProps) => {
  const openCartDrawer = useUIStore((s) => s.openCartDrawer);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.success(`Vào trang sản phẩm để chọn variant`);
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
          src={product.thumbnailUrl || `https://picsum.photos/400/400?random=${product.id}`}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
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
            <ShoppingCart className="w-4 h-4" /> Xem sản phẩm
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-primary font-medium mb-1">{product.brand}</p>
        <h3 className="font-semibold text-navy text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-navy">{formatPrice(product.price)}</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;