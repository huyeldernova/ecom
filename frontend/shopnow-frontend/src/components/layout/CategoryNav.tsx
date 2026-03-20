'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MOCK_CATEGORIES } from '@/lib/mockData/products.mock';

const CategoryNav = () => {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');

  return (
    <nav className="bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-2">
          <Link
            href="/products"
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0',
              !activeCategory
                ? 'bg-primary text-white'
                : 'text-mid-gray hover:text-primary hover:bg-primary/5'
            )}
          >
            Tất cả
          </Link>

          {MOCK_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.label}`}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0',
                activeCategory === cat.label
                  ? 'bg-primary text-white'
                  : 'text-mid-gray hover:text-primary hover:bg-primary/5'
              )}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNav;
