'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { formatPrice, debounce } from '@/lib/utils';
import { MOCK_PRODUCTS } from '@/lib/mockData/products.mock';
import { Product } from '@/types/product.types';

const TRENDING = ['Sony headphones', 'Nike shoes', 'iPad Pro', 'Dyson vacuum', 'Atomic Habits'];

const SearchModal = () => {
  const { searchModalOpen, closeSearchModal } = useUIStore();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    if (searchModalOpen) {
      const stored = localStorage.getItem('shopnow-recent-searches');
      if (stored) setRecent(JSON.parse(stored));
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [searchModalOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearchModal();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeSearchModal]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeSearchModal();
      }
    };
    if (searchModalOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [searchModalOpen, closeSearchModal]);

  const doSearch = useCallback(
    debounce((q: string) => {
      if (!q.trim()) { setResults([]); return; }
      const filtered = MOCK_PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.category.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 5);
      setResults(filtered);
    }, 300),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    doSearch(e.target.value);
  };

  const saveRecent = (q: string) => {
    const updated = [q, ...recent.filter((r) => r !== q)].slice(0, 5);
    setRecent(updated);
    localStorage.setItem('shopnow-recent-searches', JSON.stringify(updated));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    saveRecent(query.trim());
    closeSearchModal();
    router.push(`/products?name=${encodeURIComponent(query.trim())}`);
  };

  const handleSuggestionClick = (term: string) => {
    saveRecent(term);
    closeSearchModal();
    router.push(`/products?name=${encodeURIComponent(term)}`);
  };

  const clearRecent = () => {
    setRecent([]);
    localStorage.removeItem('shopnow-recent-searches');
  };

  if (!searchModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={closeSearchModal}>
      <div
        ref={containerRef}
        className="absolute left-[180px] top-[108px] w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <form onSubmit={handleSubmit} className="px-4 py-3 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Tìm kiếm sản phẩm, thương hiệu..."
            className="flex-1 text-gray-800 text-base placeholder:text-gray-400 bg-transparent focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
              className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button type="button" onClick={closeSearchModal} className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </form>

        <div className="border-t border-gray-100" />

        {/* Content */}
        <div className="px-4 py-4 space-y-4 max-h-96 overflow-y-auto">

          {/* Product results */}
          {results.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Sản phẩm</p>
              <div className="space-y-1">
                {results.map((product) => {
                  const v = product.variants[0];
                  const price = v.discountPrice ?? v.price;
                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      onClick={() => { saveRecent(product.name); closeSearchModal(); }}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-primary transition-colors truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400">{product.category}</p>
                      </div>
                      <span className="font-bold text-gray-800 text-sm shrink-0">{formatPrice(price)}</span>
                    </Link>
                  );
                })}
              </div>
              <button
                onClick={handleSubmit as unknown as React.MouseEventHandler}
                className="flex items-center gap-2 mt-3 text-sm text-primary font-medium hover:underline"
              >
                Xem tất cả kết quả cho "{query}" <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* No results */}
          {query && results.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              <p className="font-medium">Không tìm thấy "{query}"</p>
              <p className="text-sm mt-1">Thử từ khóa khác</p>
            </div>
          )}

          {/* Empty state */}
          {!query && (
            <div className="space-y-4">
              {/* Recent */}
              {recent.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tìm kiếm gần đây</p>
                    <button onClick={clearRecent} className="text-xs text-primary hover:underline">Xóa</button>
                  </div>
                  {recent.map((term) => (
                    <button key={term} onClick={() => handleSuggestionClick(term)}
                      className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-gray-50 text-sm text-gray-600 text-left">
                      <Clock className="w-3.5 h-3.5 text-gray-300" /> {term}
                    </button>
                  ))}
                </div>
              )}

              {/* Trending */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Xu hướng tìm kiếm</p>
                {TRENDING.map((term) => (
                  <button key={term} onClick={() => handleSuggestionClick(term)}
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-gray-50 text-sm text-gray-600 text-left">
                    <TrendingUp className="w-3.5 h-3.5 text-accent" /> {term}
                  </button>
                ))}
              </div>

              {/* Categories */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Danh mục phổ biến</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { emoji: '💻', label: 'Electronics' },
                    { emoji: '👗', label: 'Fashion' },
                    { emoji: '🏋️', label: 'Sports' },
                    { emoji: '🏠', label: 'Home' },
                    { emoji: '✨', label: 'Beauty' },
                    { emoji: '📚', label: 'Books' },
                  ].map((cat) => (
                    <Link key={cat.label} href={`/products?category=${cat.label}`} onClick={closeSearchModal}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-primary/10 hover:text-primary rounded-full text-sm text-gray-600 transition-colors">
                      <span>{cat.emoji}</span> {cat.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;