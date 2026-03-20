'use client';

import { useState } from 'react';
import { Send, Gift, Percent, Bell } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      toast.error('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success('Đăng ký thành công! Kiểm tra email để nhận mã giảm giá 🎁');
    setEmail('');
    setLoading(false);
  };

  const perks = [
    { icon: <Percent className="w-5 h-5" />, text: 'Giảm 10% đơn đầu tiên' },
    { icon: <Bell className="w-5 h-5" />, text: 'Thông báo flash deals sớm nhất' },
    { icon: <Gift className="w-5 h-5" />, text: 'Quà sinh nhật độc quyền' },
  ];

  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-br from-navy to-[#1a1a3e] rounded-3xl px-8 py-12 md:py-16 text-center overflow-hidden relative">
          {/* Background decoration */}
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

          <div className="relative">
            {/* Icon */}
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Gift className="w-8 h-8 text-primary" />
            </div>

            <h2 className="font-head font-bold text-3xl text-white mb-3">
              Đăng ký nhận ưu đãi độc quyền
            </h2>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              Hàng nghìn khách hàng đã nhận được ưu đãi hấp dẫn. Đừng bỏ lỡ!
            </p>

            {/* Perks */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {perks.map((perk) => (
                <div
                  key={perk.text}
                  className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-white/80 text-sm backdrop-blur-sm"
                >
                  <span className="text-accent">{perk.icon}</span>
                  {perk.text}
                </div>
              ))}
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập địa chỉ email của bạn..."
                className="flex-1 px-5 py-3 rounded-xl bg-white/10 border border-white/20
                           text-white placeholder:text-white/40 text-sm
                           focus:outline-none focus:border-primary focus:bg-white/15 transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold
                           rounded-xl transition-colors disabled:opacity-60
                           flex items-center justify-center gap-2 shrink-0"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Đang gửi...' : 'Đăng ký ngay'}
              </button>
            </form>

            <p className="text-white/30 text-xs mt-4">
              Không spam. Hủy đăng ký bất kỳ lúc nào.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
