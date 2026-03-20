import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingBag, Users, Settings } from 'lucide-react';

const adminNav = [
  { href: '/admin/inventory', icon: <Package className="w-5 h-5" />, label: 'Inventory' },
  { href: '/admin/orders', icon: <ShoppingBag className="w-5 h-5" />, label: 'Orders' },
  { href: '/admin/users', icon: <Users className="w-5 h-5" />, label: 'Users' },
  { href: '/admin/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-navy text-white flex flex-col">
        <div className="px-6 py-5 border-b border-white/10">
          <Link href="/" className="font-head font-bold text-xl text-primary">
            ShopNow
          </Link>
          <p className="text-white/40 text-xs mt-0.5">Admin Dashboard</p>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link
            href="/"
            className="text-white/40 hover:text-white text-xs transition-colors"
          >
            ← Về trang chính
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
