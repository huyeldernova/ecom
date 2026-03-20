'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductGrid from '@/components/product/ProductGrid';
import ProductFilters from '@/components/product/ProductFilters';
import ProductSort from '@/components/product/ProductSort';
import Pagination from '@/components/ui/Pagination';
import { productService } from '@/services/productService';
import { Product } from '@/types/product.types';
import { PageResponse } from '@/types/common.types';
import { MOCK_CATEGORIES } from '@/lib/mockData/products.mock';

// ─── Active Filter Pills ──────────────────────────────────
const ActiveFilters = ({
  category,
  minPrice,
  maxPrice,
}: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}) => {
  if (!category && minPrice === undefined && maxPrice === undefined) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {category && (
        <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary
                         text-sm font-medium px-3 py-1 rounded-full">
          {MOCK_CATEGORIES.find((c) => c.label === category)?.emoji} {category}
          <a href="/products" className="hover:text-primary-dark ml-0.5">
            <X className="w-3.5 h-3.5" />
          </a>
        </span>
      )}
      {(minPrice !== undefined || maxPrice !== undefined) && (
        <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary
                         text-sm font-medium px-3 py-1 rounded-full">
          {minPrice !== undefined && maxPrice !== undefined
            ? `$${minPrice} — $${maxPrice}`
            : minPrice !== undefined
            ? `Từ $${minPrice}`
            : `Đến $${maxPrice}`}
        </span>
      )}
    </div>
  );
};

// ─── Page content (uses useSearchParams) ─────────────────
const ProductListContent = () => {
  const searchParams = useSearchParams();
  const [data, setData] = useState<PageResponse<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const category = searchParams.get('category') ?? undefined;
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const sort = searchParams.get('sort') ?? 'newest';
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 0;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Phase 1-2: productService trả mock data với filter hoạt động thật
        const result = await productService.getAll({
          category,
          minPrice,
          maxPrice,
          sort,
          page,
          size: 12,
        });
        // Cast về Product[] vì mock data dùng Product thay vì ProductSummary
        setData(result as unknown as PageResponse<Product>);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, minPrice, maxPrice, sort, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page title */}
      <div className="mb-6">
        <h1 className="font-head font-bold text-2xl text-navy">
          {category ? `${MOCK_CATEGORIES.find((c) => c.label === category)?.emoji ?? ''} ${category}` : 'Tất cả sản phẩm'}
        </h1>
        {data && (
          <p className="text-mid-gray text-sm mt-1">
            {data.totalElements} sản phẩm
          </p>
        )}
      </div>

      <div className="flex gap-8">
        {/* Sidebar filter — desktop */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl border border-border p-5">
            <ProductFilters />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-5 gap-3">
            {/* Mobile filter button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-border
                         rounded-lg text-sm font-medium text-mid-gray hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Bộ lọc
            </button>

            <div className="flex-1 hidden lg:block">
              <ActiveFilters category={category} minPrice={minPrice} maxPrice={maxPrice} />
            </div>

            <ProductSort />
          </div>

          {/* Active filters — mobile */}
          <div className="lg:hidden mb-4">
            <ActiveFilters category={category} minPrice={minPrice} maxPrice={maxPrice} />
          </div>

          {/* Product grid */}
          <ProductGrid products={data?.result ?? []} loading={loading} />

          {/* Pagination */}
          {data && (
            <Pagination currentPage={data.currentPage} totalPages={data.totalPages} />
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="modal-overlay"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl p-6 overflow-y-auto animate-slide-in-right">
            <ProductFilters onClose={() => setMobileFilterOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Page wrapper with Suspense ───────────────────────────
export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
        <div className="flex gap-8">
          <div className="hidden lg:block w-56 h-96 bg-gray-200 rounded-2xl animate-pulse shrink-0" />
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    }>
      <ProductListContent />
    </Suspense>
  );
}
