'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { Order } from '@/types/order.types';
import { formatPrice } from '@/lib/utils';
import { Suspense } from 'react';

const OrdersContent = () => {
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get('payment') === 'success';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getOrders().then((res) => {
      setOrders(res.result);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Success banner */}
      {paymentSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center gap-4 mb-8">
          <CheckCircle className="w-10 h-10 text-green-500 shrink-0" />
          <div>
            <h2 className="font-head font-bold text-green-800 text-lg">Thanh toán thành công!</h2>
            <p className="text-green-700 text-sm mt-1">Đơn hàng của bạn đã được xác nhận. Cảm ơn bạn đã mua sắm tại ShopNow 🎉</p>
          </div>
        </div>
      )}

      <h1 className="font-head font-bold text-2xl text-navy mb-6">Đơn hàng của tôi</h1>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">📦</p>
          <p className="text-mid-gray">Bạn chưa có đơn hàng nào</p>
          <Link href="/products" className="mt-4 inline-block text-primary hover:underline">
            Tiếp tục mua sắm →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-mid-gray">Mã đơn hàng</p>
                  <p className="font-mono text-sm font-semibold text-navy">{order.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                  order.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="space-y-1 mb-3">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-mid-gray">{item.productName} × {item.quantity}</span>
                    <span className="font-medium text-navy">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <span className="text-sm text-mid-gray">Tổng cộng</span>
                <span className="font-bold text-navy">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-10 text-center text-mid-gray">Đang tải...</div>}>
      <OrdersContent />
    </Suspense>
  );
}