import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MOCK_CATEGORIES } from '@/lib/mockData/products.mock';

const bgColors = [
  'bg-blue-50 hover:bg-blue-100 text-blue-600',
  'bg-purple-50 hover:bg-purple-100 text-purple-600',
  'bg-green-50 hover:bg-green-100 text-green-600',
  'bg-amber-50 hover:bg-amber-100 text-amber-600',
  'bg-pink-50 hover:bg-pink-100 text-pink-600',
  'bg-indigo-50 hover:bg-indigo-100 text-indigo-600',
];

const CategorySection = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-14">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-1">
            Danh mục
          </p>
          <h2 className="font-head font-bold text-2xl text-navy">
            Mua sắm theo danh mục
          </h2>
        </div>
        <Link
          href="/products"
          className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
        >
          Xem tất cả <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {MOCK_CATEGORIES.map((cat, i) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.label}`}
            className={`flex flex-col items-center gap-3 p-5 rounded-2xl
                        border border-transparent hover:border-current/10
                        transition-all duration-200 hover:scale-105 hover:shadow-md
                        ${bgColors[i % bgColors.length]}`}
          >
            <span className="text-4xl">{cat.emoji}</span>
            <span className="font-semibold text-sm text-navy">{cat.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
