'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Facebook, Instagram, Twitter, Youtube,
  Mail, Phone, MapPin, Send, ShieldCheck,
  Truck, RefreshCw, Headphones,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';

// ─── Trust Badges ─────────────────────────────────────────
const TrustBadges = () => {
  const badges = [
    { icon: <Truck className="w-6 h-6" />, title: 'Free Shipping', desc: 'On orders over $50' },
    { icon: <RefreshCw className="w-6 h-6" />, title: 'Easy Returns', desc: '30-day return policy' },
    { icon: <ShieldCheck className="w-6 h-6" />, title: 'Secure Payment', desc: 'SSL encrypted checkout' },
    { icon: <Headphones className="w-6 h-6" />, title: '24/7 Support', desc: 'Always here to help' },
  ];

  return (
    <div className="border-y border-border bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((b) => (
            <div key={b.title} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {b.icon}
              </div>
              <div>
                <p className="font-semibold text-navy text-sm">{b.title}</p>
                <p className="text-xs text-light-gray">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Newsletter ───────────────────────────────────────────
const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      toast.error('Vui lòng nhập email hợp lệ');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success('Đăng ký nhận tin thành công! 🎉');
    setEmail('');
    setLoading(false);
  };

  return (
    <div className="bg-navy text-white py-12">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-head font-bold text-xl mb-1">
            Nhận ưu đãi độc quyền
          </h3>
          <p className="text-white/60 text-sm">
            Đăng ký để nhận thông báo về sản phẩm mới và khuyến mãi đặc biệt
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 w-full md:w-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email của bạn..."
            className="flex-1 md:w-72 px-4 py-2.5 rounded-lg bg-white/10 border border-white/20
                       text-white placeholder:text-white/40 text-sm
                       focus:outline-none focus:border-primary focus:bg-white/15 transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-primary hover:bg-primary-dark rounded-lg
                       text-white font-semibold text-sm transition-colors
                       disabled:opacity-60 flex items-center gap-2 shrink-0"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Đang gửi...' : 'Đăng ký'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Footer Link Column ───────────────────────────────────
interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

const footerColumns: FooterColumn[] = [
  {
    title: 'Mua sắm',
    links: [
      { label: 'Tất cả sản phẩm', href: '/products' },
      { label: 'Electronics', href: '/products?category=Electronics' },
      { label: 'Fashion', href: '/products?category=Fashion' },
      { label: 'Sports', href: '/products?category=Sports' },
      { label: 'Home & Living', href: '/products?category=Home' },
      { label: 'Beauty', href: '/products?category=Beauty' },
    ],
  },
  {
    title: 'Tài khoản',
    links: [
      { label: 'Đăng nhập', href: '#' },
      { label: 'Đăng ký', href: '#' },
      { label: 'Đơn hàng của tôi', href: '/profile' },
      { label: 'Danh sách yêu thích', href: '/profile' },
      { label: 'Địa chỉ giao hàng', href: '/profile' },
    ],
  },
  {
    title: 'Hỗ trợ',
    links: [
      { label: 'Trung tâm trợ giúp', href: '#' },
      { label: 'Chính sách đổi trả', href: '#' },
      { label: 'Chính sách vận chuyển', href: '#' },
      { label: 'Theo dõi đơn hàng', href: '/orders' },
      { label: 'Liên hệ chúng tôi', href: '#' },
    ],
  },
];

// ─── Social Links ─────────────────────────────────────────
const socialLinks = [
  { icon: <Facebook className="w-4 h-4" />, href: '#', label: 'Facebook' },
  { icon: <Instagram className="w-4 h-4" />, href: '#', label: 'Instagram' },
  { icon: <Twitter className="w-4 h-4" />, href: '#', label: 'Twitter' },
  { icon: <Youtube className="w-4 h-4" />, href: '#', label: 'YouTube' },
];

// ─── Main Footer ──────────────────────────────────────────
const Footer = () => {
  return (
    <footer>
      <TrustBadges />
      <Newsletter />

      {/* Main footer content */}
      <div className="bg-[#111827] text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

            {/* Brand column */}
            <div className="lg:col-span-2">
              <Link
                href="/"
                className="font-head font-bold text-2xl text-primary tracking-tight"
              >
                ShopNow
              </Link>
              <p className="text-white/50 text-sm mt-3 leading-relaxed max-w-xs">
                Nền tảng thương mại điện tử hàng đầu Việt Nam. Mua sắm thông
                minh, giao hàng nhanh, chất lượng đảm bảo.
              </p>

              {/* Contact */}
              <div className="mt-6 space-y-2">
                {[
                  { icon: <Mail className="w-4 h-4" />, text: 'support@shopnow.vn' },
                  { icon: <Phone className="w-4 h-4" />, text: '1800 6789 (Miễn phí)' },
                  { icon: <MapPin className="w-4 h-4" />, text: '123 Nguyễn Huệ, Q.1, TP.HCM' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-white/50 text-sm">
                    <span className="text-primary shrink-0">{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>

              {/* Social */}
              <div className="flex gap-2 mt-6">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-white text-sm mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-white/50 hover:text-white text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-white/30 text-xs">
              © {new Date().getFullYear()} ShopNow. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {['Điều khoản sử dụng', 'Chính sách bảo mật', 'Cookie'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-white/30 hover:text-white/60 text-xs transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
