'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { MOCK_PRODUCTS } from '@/lib/mockData/products.mock';

// ─── Countdown Timer ──────────────────────────────────────
const useCountdown = (hours: number) => {
  const [time, setTime] = useState(hours * 3600);

  useEffect(() => {
    const timer = setInterval(() => setTime((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const h = Math.floor(time / 3600).toString().padStart(2, '0');
  const m = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
  const s = (time % 60).toString().padStart(2, '0');
  return { h, m, s };
};

const TimeBlock = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
      <span className="font-head font-bold text-xl text-white">{value}</span>
    </div>
    <span className="text-white/60 text-[10px] mt-1 uppercase">{label}</span>
  </div>
);

// ─── Deal Card ────────────────────────────────────────────
const DealCard = ({
  product,
  soldPercent,
}: {
  product: (typeof MOCK_PRODUCTS)[0];
  soldPercent: number;
}) => {
  const v = product.variants[0];
  const price = v.discountPrice ?? v.price;
  const discount = v.discountPrice
    ? Math.round((1 - v.discountPrice / v.price) * 100)
    : 20;

  return (
    <Link
      href={`/products/${product.id}`}
      className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow group"
    >
      <div className="relative aspect-square bg-background overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-lg">
          -{discount}%
        </span>
      </div>
      <div className="p-4">
        <p className="text-xs text-mid-gray mb-1">{product.category}</p>
        <h3 className="font-semibold text-navy text-sm line-clamp-2 mb-3">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-bold text-primary text-lg">{formatPrice(price)}</span>
          {v.discountPrice && (
            <span className="text-xs text-light-gray line-through">{formatPrice(v.price)}</span>
          )}
        </div>
        {/* Stock progress */}
        <div>
          <div className="flex justify-between text-xs text-mid-gray mb-1">
            <span>Đã bán</span>
            <span className="font-medium">{soldPercent}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${soldPercent}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

// ─── Deals Section ────────────────────────────────────────
const DealsSection = () => {
  const { h, m, s } = useCountdown(5);
  const deals = MOCK_PRODUCTS.filter((p) =>
    p.variants.some((v) => v.discountPrice)
  ).slice(0, 4);
  const soldPercents = [72, 58, 85, 43];

  return (
    <section className="py-14">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between
                        bg-gradient-to-r from-primary to-primary-dark rounded-2xl px-6 py-5 mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <p className="text-white/70 text-xs uppercase tracking-wider">Kết thúc sau</p>
              <h2 className="font-head font-bold text-xl text-white">Flash Deals</h2>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-2">
            <TimeBlock value={h} label="giờ" />
            <span className="text-white/60 font-bold text-xl mb-4">:</span>
            <TimeBlock value={m} label="phút" />
            <span className="text-white/60 font-bold text-xl mb-4">:</span>
            <TimeBlock value={s} label="giây" />
          </div>

          <Link
            href="/products"
            className="hidden sm:flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors"
          >
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Deal cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {deals.map((product, i) => (
            <DealCard key={product.id} product={product} soldPercent={soldPercents[i]} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DealsSection;
