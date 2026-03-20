'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_CATEGORIES } from '@/lib/mockData/products.mock';

const PRICE_RANGES = [
  { label: 'Tất cả', min: undefined, max: undefined },
  { label: 'Dưới $25', min: 0, max: 25 },
  { label: '$25 — $100', min: 25, max: 100 },
  { label: '$100 — $500', min: 100, max: 500 },
  { label: '$500 — $1000', min: 500, max: 1000 },
  { label: 'Trên $1000', min: 1000, max: undefined },
];

interface ProductFiltersProps {
  onClose?: () => void; // dùng khi render trong drawer mobile
}

const ProductFilters = ({ onClose }: ProductFiltersProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get('category') ?? '';
  const activeMin = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const activeMax = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      // Reset về trang 1 khi filter thay đổi
      params.delete('page');
      Object.entries(updates).forEach(([key, val]) => {
        if (val === undefined || val === '') {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      });
      router.push(`/products?${params.toString()}`);
      onClose?.();
    },
    [router, searchParams, onClose]
  );

  const setCategory = (cat: string) =>
    updateParams({ category: cat || undefined });

  const setPriceRange = (min?: number, max?: number) =>
    updateParams({
      minPrice: min?.toString(),
      maxPrice: max?.toString(),
    });

  const clearAll = () =>
    updateParams({ category: undefined, minPrice: undefined, maxPrice: undefined });

  const hasFilters = activeCategory || activeMin !== undefined || activeMax !== undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-navy">
          <SlidersHorizontal className="w-4 h-4" />
          Bộ lọc
        </div>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button
              onClick={clearAll}
              className="text-xs text-primary hover:underline font-medium"
            >
              Xóa tất cả
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
              <X className="w-4 h-4 text-mid-gray" />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <p className="text-sm font-semibold text-navy mb-3">Danh mục</p>
        <div className="space-y-1">
          <button
            onClick={() => setCategory('')}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors',
              !activeCategory
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-mid-gray hover:bg-gray-50 hover:text-navy'
            )}
          >
            Tất cả danh mục
          </button>
          {MOCK_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.label)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors',
                activeCategory === cat.label
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-mid-gray hover:bg-gray-50 hover:text-navy'
              )}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Price range */}
      <div>
        <p className="text-sm font-semibold text-navy mb-3">Khoảng giá</p>
        <div className="space-y-1">
          {PRICE_RANGES.map((range) => {
            const isActive =
              activeMin === range.min && activeMax === range.max;
            return (
              <button
                key={range.label}
                onClick={() => setPriceRange(range.min, range.max)}
                className={cn(
                  'w-full flex items-center px-3 py-2 rounded-lg text-sm text-left transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-mid-gray hover:bg-gray-50 hover:text-navy'
                )}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
