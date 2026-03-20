'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Search, ShoppingCart, Heart, User, Menu, X,
  ChevronDown, Sun, Moon, Bell, LogOut, Package,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { cn } from '@/lib/utils';
import { MOCK_CATEGORIES } from '@/lib/mockData/products.mock';

// ─── Top Promo Bar ────────────────────────────────────────
const PromoBar = () => (
  <div className="bg-navy text-white text-xs text-center py-2 px-4">
    🎉 Free shipping on orders over $50 · Use code{' '}
    <span className="font-semibold text-accent">SHOPNOW10</span> for 10% off
  </div>
);

// ─── Dark Mode Toggle ─────────────────────────────────────
const DarkModeToggle = () => {
  const [dark, setDark] = useState(false);

  const toggle = () => {
    setDark((prev) => {
      document.documentElement.classList.toggle('dark', !prev);
      return !prev;
    });
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg text-mid-gray hover:text-navy hover:bg-gray-100 transition-colors"
      aria-label="Toggle dark mode"
    >
      {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};

// ─── Search Bar ───────────────────────────────────────────
const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<typeof MOCK_PRODUCTS>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    setResults(
      MOCK_PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.category.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 5)
    );
  };

  const TRENDING = ['Sony headphones', 'Nike shoes', 'iPad Pro', 'Dyson vacuum', 'Atomic Habits'];

  return (
    <div ref={ref} className="relative flex-1 max-w-xl">
      {/* Input */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background hover:border-primary/40 hover:bg-white transition-colors">
        <Search className="w-4 h-4 text-light-gray shrink-0" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          placeholder="Tìm kiếm sản phẩm..."
          className="flex-1 text-sm text-navy bg-transparent placeholder:text-light-gray focus:outline-none"
        />
        {query && (
                  <button onClick={() => { setQuery(''); setResults([]); }}>
                    <X className="w-4 h-4 text-light-gray hover:text-navy" />
                  </button>
                )}
              </div>

              {/* Search button */}
              <button
                onClick={() => {
                  if (query.trim()) {
                    setOpen(false);
                    window.location.href = `/products?name=${encodeURIComponent(query.trim())}`;
                  }
                }}
                className="absolute right-0 top-0 bottom-0 px-4 bg-primary hover:bg-primary-dark
                           text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">

            {/* Results */}
            {results.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Sản phẩm</p>
                {results.map((product) => {
                  const v = product.variants[0];
                  const price = v.discountPrice ?? v.price;
                  return (
                    <Link key={product.id} href={`/products/${product.id}`}
                      onClick={() => { setOpen(false); setQuery(''); setResults([]); }}
                      className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-navy truncate group-hover:text-primary">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.category}</p>
                      </div>
                      <span className="text-sm font-bold text-navy shrink-0">${price}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* No results */}
            {query && results.length === 0 && (
              <p className="text-sm text-center text-gray-400 py-4">Không tìm thấy "{query}"</p>
            )}

            {/* Empty state */}
            {!query && (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Xu hướng tìm kiếm</p>
                  {TRENDING.map((term) => (
                    <Link key={term} href={`/products?name=${encodeURIComponent(term)}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-gray-50 text-sm text-gray-600 text-left">
                      📈 {term}
                    </Link>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Danh mục phổ biến</p>
                  <div className="flex flex-wrap gap-2">
                    {[{e:'💻',l:'Electronics'},{e:'👗',l:'Fashion'},{e:'🏋️',l:'Sports'},{e:'🏠',l:'Home'},{e:'✨',l:'Beauty'},{e:'📚',l:'Books'}].map((cat) => (
                      <Link key={cat.l} href={`/products?category=${cat.l}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-primary/10 hover:text-primary rounded-full text-sm text-gray-600 transition-colors">
                        {cat.e} {cat.l}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Cart Button ──────────────────────────────────────────
const CartButton = () => {
  const { openCartDrawer } = useUIStore();
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    setItemCount(useCartStore.getState().itemCount());
    const unsub = useCartStore.subscribe((s) => {
      setItemCount(s.itemCount());
    });
    return unsub;
  }, []);

  return (
    <button
      onClick={openCartDrawer}
      className="relative p-2 rounded-lg text-mid-gray hover:text-navy hover:bg-gray-100 transition-colors"
      aria-label="Giỏ hàng"
    >
      <ShoppingCart className="w-5 h-5" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
                         bg-primary text-white text-[10px] font-bold rounded-full
                         flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
};

// ─── Wishlist Button ──────────────────────────────────────
const WishlistButton = () => {
  const { openWishlistDrawer } = useUIStore();

  return (
    <button
      onClick={openWishlistDrawer}
      className="p-2 rounded-lg text-mid-gray hover:text-navy hover:bg-gray-100 transition-colors"
      aria-label="Wishlist"
    >
      <Heart className="w-5 h-5" />
    </button>
  );
};

// ─── User Menu ────────────────────────────────────────────
const UserMenu = () => {
  const { openAuthModal } = useUIStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!isAuthenticated) {
    return (
      <button
        onClick={() => openAuthModal('login')}
        className="flex items-center gap-2 px-4 py-2 rounded-lg
                   bg-primary text-white text-sm font-semibold
                   hover:bg-primary-dark transition-colors"
      >
        <User className="w-4 h-4" />
        Đăng nhập
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary text-sm font-bold">
            {user?.firstName?.[0] ?? 'U'}
          </span>
        </div>
        <ChevronDown className={cn('w-4 h-4 text-mid-gray transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl
                        border border-border shadow-lg py-1 z-50 animate-scale-in">
          <div className="px-4 py-3 border-b border-border">
            <p className="font-semibold text-navy text-sm">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-light-gray truncate">{user?.email}</p>
          </div>

          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-mid-gray hover:bg-gray-50 hover:text-navy transition-colors"
          >
            <User className="w-4 h-4" /> Tài khoản của tôi
          </Link>
          <Link
            href="/orders"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-mid-gray hover:bg-gray-50 hover:text-navy transition-colors"
          >
            <Package className="w-4 h-4" /> Đơn hàng
          </Link>

          {user?.role === 'ADMIN' && (
            <Link
              href="/admin/inventory"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-mid-gray hover:bg-gray-50 hover:text-navy transition-colors"
            >
              <Bell className="w-4 h-4" /> Quản lý kho
            </Link>
          )}

          <div className="border-t border-border mt-1">
            <button
              onClick={() => { logout(); setOpen(false); }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Category Nav ─────────────────────────────────────────
const CategoryNav = () => (
  <nav className="border-t border-border bg-white">
    <div className="max-w-7xl mx-auto px-4">
      <ul className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
        <li>
          <Link
            href="/products"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-mid-gray
                       hover:text-primary hover:bg-primary/5 rounded-lg transition-colors whitespace-nowrap"
          >
            Tất cả
          </Link>
        </li>
        {MOCK_CATEGORIES.map((cat) => (
          <li key={cat.id}>
            <Link
              href={`/products?category=${cat.label}`}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-mid-gray
                         hover:text-primary hover:bg-primary/5 rounded-lg transition-colors whitespace-nowrap"
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </nav>
);

// ─── Mobile Menu ──────────────────────────────────────────
const MobileMenu = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { openAuthModal } = useUIStore();
  const { isAuthenticated, user, logout } = useAuthStore();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="modal-overlay" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <span className="font-head font-bold text-xl text-primary">ShopNow</span>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
          {MOCK_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.label}`}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 text-mid-gray hover:text-navy transition-colors"
            >
              <span className="text-xl">{cat.emoji}</span>
              <span className="font-medium">{cat.label}</span>
            </Link>
          ))}
        </div>

        <div className="border-t border-border p-4">
          {isAuthenticated ? (
            <div className="space-y-2">
              <p className="font-semibold text-navy">{user?.firstName} {user?.lastName}</p>
              <button
                onClick={() => { logout(); onClose(); }}
                className="flex items-center gap-2 text-sm text-red-500"
              >
                <LogOut className="w-4 h-4" /> Đăng xuất
              </button>
            </div>
          ) : (
            <button
              onClick={() => { openAuthModal('login'); onClose(); }}
              className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold text-sm"
            >
              Đăng nhập / Đăng ký
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Header ──────────────────────────────────────────
const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <PromoBar />
      <header
        className={cn(
          'sticky top-0 z-40 bg-white transition-shadow duration-200',
          scrolled && 'shadow-md'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg text-mid-gray hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="font-head font-bold text-2xl text-primary shrink-0 tracking-tight"
          >
            ShopNow
          </Link>

          {/* Search bar — hidden on mobile */}
          <div className="hidden md:flex flex-1">
            <SearchBar />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Search icon — mobile only */}
            <button
              className="md:hidden p-2 rounded-lg text-mid-gray hover:bg-gray-100 transition-colors"
              onClick={useUIStore.getState().openSearchModal}
            >
              <Search className="w-5 h-5" />
            </button>

            <DarkModeToggle />
            <WishlistButton />
            <CartButton />
            <UserMenu />
          </div>
        </div>

        {/* Category nav — desktop */}
        <div className="hidden lg:block">
          <CategoryNav />
        </div>
      </header>

      {/* Mobile menu */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
};

export default Header;
