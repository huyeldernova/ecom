'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import {
  User, Package, Heart, MapPin, CreditCard,
  Star, Clock, LogOut, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PersonalInfo from '@/components/profile/ProfileTabs/PersonalInfo';
import MyOrders from '@/components/profile/ProfileTabs/MyOrders';
import { Wishlist } from '@/components/profile/ProfileTabs/Wishlist';
import { MyAddresses, PaymentMethods, LoyaltyRewards, RecentlyViewed } from '@/components/profile/ProfileTabs/OtherTabs';

type Tab = 'info' | 'orders' | 'wishlist' | 'addresses' | 'payments' | 'loyalty' | 'recent';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'info', label: 'Thông tin', icon: <User className="w-4 h-4" /> },
  { id: 'orders', label: 'Đơn hàng', icon: <Package className="w-4 h-4" /> },
  { id: 'wishlist', label: 'Yêu thích', icon: <Heart className="w-4 h-4" /> },
  { id: 'addresses', label: 'Địa chỉ', icon: <MapPin className="w-4 h-4" /> },
  { id: 'payments', label: 'Thanh toán', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'loyalty', label: 'Tích điểm', icon: <Star className="w-4 h-4" /> },
  { id: 'recent', label: 'Đã xem', icon: <Clock className="w-4 h-4" /> },
];

export default function ProfilePage() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [activeTab, setActiveTab] = useState<Tab>('info');

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <User className="w-10 h-10 text-primary" />
        </div>
        <h1 className="font-head font-bold text-2xl text-navy mb-2">Đăng nhập để tiếp tục</h1>
        <p className="text-mid-gray mb-6">Bạn cần đăng nhập để xem thông tin tài khoản</p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
        >
          Đăng nhập
        </button>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'info': return <PersonalInfo />;
      case 'orders': return <MyOrders />;
      case 'wishlist': return <Wishlist />;
      case 'addresses': return <MyAddresses />;
      case 'payments': return <PaymentMethods />;
      case 'loyalty': return <LoyaltyRewards />;
      case 'recent': return <RecentlyViewed />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="bg-white rounded-2xl border border-border overflow-hidden sticky top-24">
            {/* User card */}
            <div className="p-5 bg-gradient-to-br from-navy to-[#1a1a3e]">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                <span className="text-primary font-bold text-2xl">{user?.firstName?.[0]}</span>
              </div>
              <p className="font-semibold text-white">{user?.firstName} {user?.lastName}</p>
              <p className="text-white/50 text-xs truncate">{user?.email}</p>
            </div>

            {/* Nav */}
            <nav className="p-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-mid-gray hover:bg-gray-50 hover:text-navy'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {tab.icon}
                    {tab.label}
                  </div>
                  {activeTab === tab.id && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              ))}
              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors mt-1"
              >
                <LogOut className="w-4 h-4" /> Đăng xuất
              </button>
            </nav>
          </div>
        </aside>

        {/* Mobile tab selector */}
        <div className="lg:hidden w-full mb-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap shrink-0 transition-colors',
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'bg-white border border-border text-mid-gray'
                )}
              >
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-border p-6">
            {renderTab()}
          </div>
        </main>
      </div>
    </div>
  );
}
