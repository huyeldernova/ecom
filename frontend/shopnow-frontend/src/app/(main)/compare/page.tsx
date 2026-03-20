'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, Plus, Check } from 'lucide-react';
import { MOCK_PRODUCTS } from '@/lib/mockData/products.mock';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types/product.types';
import { useCartStore } from '@/stores/cartStore';
import { toast } from '@/components/ui/Toast';
import { CartItem } from '@/types/cart.types';

export default function ComparePage() {
  const [selected, setSelected] = useState<Product[]>(MOCK_PRODUCTS.slice(0, 2));
  const [picking, setPicking] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const addProduct = (product: Product) => {
    if (selected.find((p) => p.id === product.id)) return;
    if (selected.length >= 4) { toast.error('Chỉ so sánh tối đa 4 sản phẩm'); return; }
    setSelected((prev) => [...prev, product]);
    setPicking(false);
  };

  const removeProduct = (id: string) => setSelected((prev) => prev.filter((p) => p.id !== id));

  const handleAddToCart = (product: Product) => {
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

  const specs = ['category', 'variants', 'minPrice', 'discount'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-head font-bold text-2xl text-navy">So sánh sản phẩm</h1>
        <p className="text-mid-gray text-sm mt-1">Tối đa 4 sản phẩm</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-separate border-spacing-3">
          <thead>
            <tr>
              <td className="w-36" />
              {selected.map((product) => (
                <td key={product.id} className="bg-white rounded-2xl border border-border p-4 align-top">
                  <div className="relative">
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="aspect-square rounded-xl overflow-hidden bg-background mb-3">
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <Link href={`/products/${product.id}`}>
                      <p className="font-semibold text-navy text-sm hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                      </p>
                    </Link>
                    <p className="font-bold text-navy mt-1">
                      {formatPrice(Math.min(...product.variants.map((v) => v.discountPrice ?? v.price)))}
                    </p>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full mt-3 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-dark transition-colors"
                    >
                      Thêm vào giỏ
                    </button>
                  </div>
                </td>
              ))}
              {selected.length < 4 && (
                <td className="bg-gray-50 rounded-2xl border-2 border-dashed border-border p-4">
                  <button
                    onClick={() => setPicking(true)}
                    className="w-full h-full flex flex-col items-center justify-center gap-2 text-mid-gray hover:text-primary transition-colors py-8"
                  >
                    <Plus className="w-8 h-8" />
                    <span className="text-sm font-medium">Thêm sản phẩm</span>
                  </button>
                </td>
              )}
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Danh mục', render: (p: Product) => p.category },
              { label: 'Số variants', render: (p: Product) => `${p.variants.length} loại` },
              { label: 'Giá thấp nhất', render: (p: Product) => formatPrice(Math.min(...p.variants.map((v) => v.discountPrice ?? v.price))) },
              { label: 'Có giảm giá', render: (p: Product) => p.variants.some((v) => v.discountPrice) ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" /> },
            ].map((row) => (
              <tr key={row.label}>
                <td className="text-sm font-semibold text-mid-gray py-2 pr-4 whitespace-nowrap">{row.label}</td>
                {selected.map((p) => (
                  <td key={p.id} className="bg-white rounded-xl border border-border px-4 py-3 text-sm text-navy text-center">
                    {row.render(p)}
                  </td>
                ))}
                {selected.length < 4 && <td />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product picker */}
      {picking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="modal-overlay absolute inset-0" onClick={() => setPicking(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-10 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-head font-bold text-navy">Chọn sản phẩm để so sánh</h3>
              <button onClick={() => setPicking(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-mid-gray">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {MOCK_PRODUCTS.filter((p) => !selected.find((s) => s.id === p.id)).map((p) => (
                <button key={p.id} onClick={() => addProduct(p)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-background border border-border shrink-0">
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">{p.name}</p>
                    <p className="text-xs text-mid-gray">{p.category}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
