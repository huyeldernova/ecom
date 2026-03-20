'use client';
import { MapPin, Plus, CreditCard, Star, Clock } from 'lucide-react';
import { MOCK_PRODUCTS } from '@/lib/mockData/products.mock';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

// ─── MyAddresses ──────────────────────────────────────────
export const MyAddresses = () => {
  const addresses = [
    { id: 1, label: 'Nhà', name: 'Nguyễn Văn A', phone: '0901234567', street: '123 Nguyễn Huệ', city: 'Hồ Chí Minh', isDefault: true },
    { id: 2, label: 'Công ty', name: 'Nguyễn Văn A', phone: '0901234567', street: '45 Lê Lợi', city: 'Hồ Chí Minh', isDefault: false },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-head font-bold text-xl text-navy">Địa chỉ của tôi</h2>
          <p className="text-mid-gray text-sm mt-1">{addresses.length} địa chỉ đã lưu</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-primary text-primary text-sm font-medium rounded-xl hover:bg-primary hover:text-white transition-colors">
          <Plus className="w-4 h-4" /> Thêm địa chỉ
        </button>
      </div>
      <div className="space-y-3">
        {addresses.map((addr) => (
          <div key={addr.id} className="bg-white rounded-2xl border border-border p-4 relative">
            {addr.isDefault && (
              <span className="absolute top-4 right-4 text-xs bg-green-50 text-green-600 font-medium px-2.5 py-1 rounded-full border border-green-200">
                Mặc định
              </span>
            )}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-navy">{addr.label}</p>
                <p className="text-sm text-mid-gray mt-0.5">{addr.name} · {addr.phone}</p>
                <p className="text-sm text-mid-gray">{addr.street}, {addr.city}</p>
                <div className="flex gap-3 mt-3">
                  <button className="text-xs text-primary hover:underline font-medium">Chỉnh sửa</button>
                  {!addr.isDefault && <button className="text-xs text-mid-gray hover:text-navy">Đặt mặc định</button>}
                  {!addr.isDefault && <button className="text-xs text-red-400 hover:text-red-600">Xóa</button>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── PaymentMethods ───────────────────────────────────────
export const PaymentMethods = () => {
  const cards = [
    { id: 1, brand: 'Visa', last4: '4242', expiry: '12/26', isDefault: true },
    { id: 2, brand: 'Mastercard', last4: '5555', expiry: '08/25', isDefault: false },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-head font-bold text-xl text-navy">Phương thức thanh toán</h2>
          <p className="text-mid-gray text-sm mt-1">Quản lý thẻ thanh toán của bạn</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-primary text-primary text-sm font-medium rounded-xl hover:bg-primary hover:text-white transition-colors">
          <Plus className="w-4 h-4" /> Thêm thẻ
        </button>
      </div>
      <div className="space-y-3">
        {cards.map((card) => (
          <div key={card.id} className="bg-white rounded-2xl border border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 bg-navy rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-navy text-sm">
                  {card.brand} •••• {card.last4}
                  {card.isDefault && (
                    <span className="ml-2 text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-200">Mặc định</span>
                  )}
                </p>
                <p className="text-xs text-mid-gray">Hết hạn {card.expiry}</p>
              </div>
            </div>
            <button className="text-xs text-red-400 hover:text-red-600 transition-colors">Xóa</button>
          </div>
        ))}
      </div>
      <p className="text-xs text-light-gray bg-gray-50 rounded-xl p-3">
        🔒 Thông tin thẻ được bảo mật bởi Stripe. ShopNow không lưu trữ số thẻ của bạn.
      </p>
    </div>
  );
};

// ─── LoyaltyRewards ───────────────────────────────────────
export const LoyaltyRewards = () => {
  const points = 1250;
  const tier = points >= 2000 ? 'Gold' : points >= 1000 ? 'Silver' : 'Bronze';
  const tierColors: Record<string, string> = {
    Bronze: 'text-amber-700 bg-amber-50 border-amber-200',
    Silver: 'text-gray-600 bg-gray-50 border-gray-200',
    Gold: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  };
  const nextTier = tier === 'Bronze' ? 1000 : tier === 'Silver' ? 2000 : null;
  const progress = nextTier ? Math.min((points / nextTier) * 100, 100) : 100;

  return (
    <div className="space-y-5">
      <h2 className="font-head font-bold text-xl text-navy">Tích điểm & Ưu đãi</h2>
      <div className="bg-gradient-to-br from-navy to-[#1a1a3e] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/60 text-sm">Điểm hiện tại</p>
            <p className="font-head font-bold text-4xl mt-1">{points.toLocaleString()}</p>
            <p className="text-white/60 text-xs mt-1">điểm tích lũy</p>
          </div>
          <div className={`px-4 py-2 rounded-xl border text-sm font-bold ${tierColors[tier]}`}>
            ⭐ {tier}
          </div>
        </div>
        {nextTier && (
          <div>
            <div className="flex justify-between text-xs text-white/60 mb-1.5">
              <span>{points} điểm</span>
              <span>{nextTier} điểm để lên {tier === 'Bronze' ? 'Silver' : 'Gold'}</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Đơn hàng', value: '6', icon: '📦' },
          { label: 'Điểm đã dùng', value: '300', icon: '✅' },
          { label: 'Tiết kiệm', value: '$45', icon: '💰' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-border p-4 text-center">
            <p className="text-2xl mb-1">{stat.icon}</p>
            <p className="font-bold text-navy text-lg">{stat.value}</p>
            <p className="text-xs text-mid-gray">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── RecentlyViewed ───────────────────────────────────────
export const RecentlyViewed = () => {
  const recent = MOCK_PRODUCTS.slice(0, 4);

  if (recent.length === 0) {
    return (
      <div className="text-center py-16">
        <Clock className="w-10 h-10 mx-auto mb-3 text-gray-200" />
        <p className="text-mid-gray">Chưa có lịch sử xem</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="font-head font-bold text-xl text-navy">Đã xem gần đây</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recent.map((product) => {
          const v = product.variants[0];
          const price = v.discountPrice ?? v.price;
          return (
            <Link key={product.id} href={`/products/${product.id}`}
              className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow group">
              <div className="aspect-square bg-background overflow-hidden">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-3">
                <p className="text-xs text-mid-gray">{product.category}</p>
                <p className="font-semibold text-navy text-sm line-clamp-2 group-hover:text-primary transition-colors">{product.name}</p>
                <p className="font-bold text-navy mt-1">{formatPrice(price)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
