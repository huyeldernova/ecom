'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';
import { ProductSortOption } from '@/types/product.types';

const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá: Thấp → Cao' },
  { value: 'price_desc', label: 'Giá: Cao → Thấp' },
  { value: 'popular', label: 'Phổ biến nhất' },
];

const ProductSort = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSort = (searchParams.get('sort') as ProductSortOption) ?? 'newest';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="w-4 h-4 text-light-gray shrink-0" />
      <select
        value={activeSort}
        onChange={handleChange}
        className="text-sm text-navy border border-border rounded-lg px-3 py-2
                   bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                   cursor-pointer transition-colors"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProductSort;
