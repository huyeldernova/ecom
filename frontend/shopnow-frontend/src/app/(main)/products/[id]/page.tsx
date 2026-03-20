'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCart, Heart, Share2, Shield, Truck,
  RefreshCw, Star, ChevronRight, Minus, Plus,
} from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import { productService } from '@/services/productService';
import { toast } from '@/components/ui/Toast';
import { formatPrice } from '@/lib/utils';
import { Product, ProductVariant } from '@/types/product.types';
import { CartItem } from '@/types/cart.types';
import ProductImages from '@/components/product/ProductImages';
import ProductVariants from '@/components/product/ProductVariants';
import { MOCK_PRODUCTS } from '@/lib/mockData/products.mock';

// ─── Quantity Selector ────────────────────────────────────
const QuantitySelector = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="flex items-center border border-border rounded-xl overflow-hidden">
    <button
      onClick={() => onChange(Math.max(1, value - 1))}
      className="w-10 h-10 flex items-center justify-center text-mid-gray hover:bg-gray-50 hover:text-navy transition-colors"
    >
      <Minus className="w-4 h-4" />
    </button>
    <span className="w-12 text-center font-semibold text-navy text-sm">{value}</span>
    <button
      onClick={() => onChange(value + 1)}
      className="w-10 h-10 flex items-center justify-center text-mid-gray hover:bg-gray-50 hover:text-navy transition-colors"
    >
      <Plus className="w-4 h-4" />
    </button>
  </div>
);

// ─── Trust Badges ─────────────────────────────────────────
const TrustRow = () => (
  <div className="grid grid-cols-3 gap-3 py-4 border-t border-b border-border">
    {[
      { icon: <Truck className="w-4 h-4" />, text: 'Giao hàng miễn phí' },
      { icon: <RefreshCw className="w-4 h-4" />, text: 'Đổi trả 30 ngày' },
      { icon: <Shield className="w-4 h-4" />, text: 'Bảo hành chính hãng' },
    ].map((item) => (
      <div key={item.text} className="flex flex-col items-center gap-1.5 text-center">
        <span className="text-primary">{item.icon}</span>
        <span className="text-xs text-mid-gray leading-snug">{item.text}</span>
      </div>
    ))}
  </div>
);

// ─── Related Products ─────────────────────────────────────
const RelatedProducts = ({ category, excludeId }: { category: string; excludeId: string }) => {
  const related = MOCK_PRODUCTS.filter(
    (p) => p.category === category && p.id !== excludeId
  ).slice(0, 4);

  if (related.length === 0) return null;

  return (
    <div className="mt-16">
      <h2 className="font-head font-bold text-xl text-navy mb-6">Sản phẩm liên quan</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {related.map((p) => {
          const v = p.variants[0];
          const price = v.discountPrice ?? v.price;
          return (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-background overflow-hidden">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-3">
                <p className="text-xs text-mid-gray mb-0.5">{p.category}</p>
                <p className="text-sm font-semibold text-navy line-clamp-2 group-hover:text-primary transition-colors">
                  {p.name}
                </p>
                <p className="font-bold text-navy mt-2">{formatPrice(price)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const openCartDrawer = useUIStore((s) => s.openCartDrawer);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await productService.getById(id);
        setProduct(data);
        setSelectedVariant(data.variants[0]);
      } catch {
        toast.error('Không tìm thấy sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-4 bg-gray-200 rounded animate-pulse ${i === 0 ? 'w-1/3' : i === 1 ? 'w-3/4' : 'w-full'}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product || !selectedVariant) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-mid-gray">Không tìm thấy sản phẩm</p>
        <Link href="/products" className="text-primary hover:underline mt-2 inline-block">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  const price = selectedVariant.discountPrice ?? selectedVariant.price;
  const hasDiscount = !!selectedVariant.discountPrice;
  const discountPct = hasDiscount
    ? Math.round((1 - selectedVariant.discountPrice! / selectedVariant.price) * 100)
    : 0;

  // Build image array — use variant image if available, fallback to product image
  const images = product.variants
    .filter((v) => v.imageUrl)
    .map((v) => v.imageUrl!)
    .concat(product.imageUrl)
    .filter((v, i, a) => a.indexOf(v) === i) // dedupe
    .slice(0, 5);

  const handleAddToCart = () => {
    const item: CartItem = {
      id: `${product.id}-${selectedVariant.id}-${Date.now()}`,
      productId: product.id,
      productVariantId: selectedVariant.id,
      productName: product.name,
      variantName: selectedVariant.variantName,
      imageUrl: product.imageUrl,
      quantity,
      snapshotPrice: price,
    };
    addItem(item);
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng 🛒`);
    openCartDrawer();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-mid-gray mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/products" className="hover:text-primary transition-colors">Sản phẩm</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          href={`/products?category=${product.category}`}
          className="hover:text-primary transition-colors"
        >
          {product.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-navy font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Images */}
        <ProductImages images={images} productName={product.name} />

        {/* Info */}
        <div className="space-y-5">
          {/* Category + share */}
          <div className="flex items-center justify-between">
            <Link
              href={`/products?category=${product.category}`}
              className="text-sm text-primary font-medium hover:underline"
            >
              {product.category}
            </Link>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.info('Đã sao chép link sản phẩm');
              }}
              className="p-2 rounded-lg text-light-gray hover:text-navy hover:bg-gray-100 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Name */}
          <h1 className="font-head font-bold text-2xl md:text-3xl text-navy leading-tight">
            {product.name}
          </h1>

          {/* Mock rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i <= 4 ? 'fill-accent text-accent' : 'fill-gray-200 text-gray-200'}`}
                />
              ))}
            </div>
            <span className="text-sm text-mid-gray">(4.0) · 128 đánh giá</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="font-head font-bold text-3xl text-navy">
              {formatPrice(price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-light-gray line-through">
                  {formatPrice(selectedVariant.price)}
                </span>
                <span className="bg-primary/10 text-primary text-sm font-bold px-2.5 py-0.5 rounded-lg">
                  -{discountPct}%
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-mid-gray text-sm leading-relaxed">
            {product.description}
          </p>

          {/* Variants */}
          <ProductVariants
            variants={product.variants}
            selected={selectedVariant}
            onChange={setSelectedVariant}
          />

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-3 pt-2">
            <QuantitySelector value={quantity} onChange={setQuantity} />
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2
                         bg-primary hover:bg-primary-dark text-white font-semibold
                         py-2.5 rounded-xl transition-colors shadow-md shadow-primary/20"
            >
              <ShoppingCart className="w-5 h-5" />
              Thêm vào giỏ hàng
            </button>
            <button
              onClick={() => setWishlisted((v) => !v)}
              className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-colors ${
                wishlisted
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-mid-gray hover:border-primary/50 hover:text-primary'
              }`}
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-primary' : ''}`} />
            </button>
          </div>

          {/* Buy now */}
          <Link
            href="/checkout"
            onClick={handleAddToCart}
            className="block w-full text-center py-2.5 border-2 border-navy text-navy
                       font-semibold rounded-xl hover:bg-navy hover:text-white transition-colors"
          >
            Mua ngay
          </Link>

          {/* Trust badges */}
          <TrustRow />
        </div>
      </div>

      {/* Related */}
      <RelatedProducts category={product.category} excludeId={product.id} />
    </div>
  );
}
