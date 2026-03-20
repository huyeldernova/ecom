'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

const Pagination = ({ currentPage, totalPages }: PaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`/products?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build page numbers array with ellipsis
  const getPages = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i);
    const pages: (number | '...')[] = [];
    if (currentPage <= 3) {
      pages.push(0, 1, 2, 3, '...', totalPages - 1);
    } else if (currentPage >= totalPages - 4) {
      pages.push(0, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1);
    } else {
      pages.push(0, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages - 1);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      {/* Prev */}
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 0}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium
                   border border-border text-mid-gray hover:bg-gray-50 hover:text-navy
                   disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Trước
      </button>

      {/* Pages */}
      {getPages().map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 py-2 text-light-gray text-sm">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => goToPage(page as number)}
            className={cn(
              'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
              currentPage === page
                ? 'bg-primary text-white shadow-sm shadow-primary/30'
                : 'border border-border text-mid-gray hover:bg-gray-50 hover:text-navy'
            )}
          >
            {(page as number) + 1}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium
                   border border-border text-mid-gray hover:bg-gray-50 hover:text-navy
                   disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Sau <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
