'use client';

import Link from 'next/link';
import { ArrowRight, ShoppingBag, Star } from 'lucide-react';

const HeroBanner = () => {
  return (
    <section className="relative bg-gradient-to-br from-navy via-[#1a1a3e] to-[#2d1b4e] overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 -left-12 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-white space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span>Ưu đãi đặc biệt — Giảm đến 50%</span>
            </div>

            {/* Heading */}
            <h1 className="font-head font-bold text-4xl md:text-5xl lg:text-6xl leading-tight">
              Mua sắm{' '}
              <span className="text-primary">thông minh</span>,{' '}
              <br />
              sống{' '}
              <span className="text-accent">chất lượng</span>
            </h1>

            <p className="text-white/60 text-lg leading-relaxed max-w-md">
              Khám phá hàng nghìn sản phẩm chính hãng với giá tốt nhất.
              Giao hàng nhanh, đổi trả dễ dàng, thanh toán an toàn.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark
                           text-white font-semibold rounded-xl transition-colors shadow-lg shadow-primary/30"
              >
                <ShoppingBag className="w-5 h-5" />
                Mua sắm ngay
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/products?category=Electronics"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/20
                           hover:bg-white/10 text-white font-semibold rounded-xl transition-colors backdrop-blur-sm"
              >
                Xem ưu đãi
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-2">
              {[
                { value: '50K+', label: 'Sản phẩm' },
                { value: '200K+', label: 'Khách hàng' },
                { value: '4.9★', label: 'Đánh giá' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-head font-bold text-2xl text-white">{stat.value}</p>
                  <p className="text-white/50 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Product showcase cards */}
          <div className="hidden md:grid grid-cols-2 gap-4">
            {[
              { emoji: '💻', name: 'Sony WH-1000XM5', price: '$349', badge: 'Hot', color: 'from-blue-500/20 to-purple-500/20', img: 1 },
              { emoji: '👟', name: 'Nike Air Max 270', price: '$129', badge: '-14%', color: 'from-orange-500/20 to-red-500/20', img: 5 },
              { emoji: '⌚', name: 'Garmin Forerunner', price: '$449', badge: 'New', color: 'from-green-500/20 to-teal-500/20', img: 7 },
              { emoji: '📖', name: 'Atomic Habits', price: '$14', badge: 'Best', color: 'from-yellow-500/20 to-amber-500/20', img: 13 },
            ].map((item, i) => (
              <div
                key={i}
                className={`relative bg-gradient-to-br ${item.color} backdrop-blur-sm border border-white/10
                            rounded-2xl p-4 hover:scale-105 transition-transform cursor-pointer
                            ${i === 1 ? 'mt-6' : ''}`}
              >
                <span className="absolute top-3 right-3 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
                <div className="w-full aspect-square rounded-xl bg-white/10 flex items-center justify-center text-5xl mb-3">
                  {item.emoji}
                </div>
                <p className="text-white text-sm font-semibold leading-snug">{item.name}</p>
                <p className="text-accent font-bold mt-1">{item.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
