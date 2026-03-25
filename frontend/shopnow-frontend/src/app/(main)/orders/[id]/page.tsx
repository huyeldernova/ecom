'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { formatPrice, formatDate } from '@/lib/utils';
import { OrderStatus } from '@/types/order.types';
import { useState, useEffect } from 'react';
import { orderService } from '@/services/orderService';
import { Order } from '@/types/order.types';

const TIMELINE_STEPS: { status: OrderStatus; label: string; desc: string; icon: React.ReactNode }[] = [
  { status: 'PENDING', label: 'Đặt hàng', desc: 'Đơn hàng đã được tiếp nhận', icon: <Clock className="w-4 h-4" /> },
  { status: 'CONFIRMED', label: 'Xác nhận', desc: 'Đơn hàng đã được xác nhận', icon: <CheckCircle className="w-4 h-4" /> },
  { status: 'SHIPPING', label: 'Đang giao', desc: 'Đơn hàng đang trên đường', icon: <Truck className="w-4 h-4" /> },
  { status: 'DELIVERED', label: 'Đã giao', desc: 'Đơn hàng đã được giao', icon: <Package className="w-4 h-4" /> },
];

const STATUS_ORDER: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED'];

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getOrderById(id)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (!order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-2xl mb-3">📦</p>
        <h2 className="font-head font-bold text-xl text-navy mb-2">Không tìm thấy đơn hàng</h2>
        <Link href="/profile" className="text-primary hover:underline">← Đơn hàng của tôi</Link>
      </div>
    );
  }

  const currentStep = order.status === 'CANCELLED' ? -1 : STATUS_ORDER.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-mid-gray mb-6">
        <Link href="/profile" className="hover:text-primary">Tài khoản</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-navy font-medium">Đơn #{order.id.slice(-8).toUpperCase()}</span>
      </nav>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main */}
        <div className="md:col-span-2 space-y-5">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-1">
              <h1 className="font-head font-bold text-xl text-navy">
                Đơn #{order.id.slice(-8).toUpperCase()}
              </h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-sm text-mid-gray">Đặt ngày {formatDate(order.createdAt)}</p>
          </div>

          {/* Timeline */}
          {order.status !== 'CANCELLED' ? (
            <div className="bg-white rounded-2xl border border-border p-5">
              <h2 className="font-semibold text-navy mb-5">Trạng thái đơn hàng</h2>
              <div className="space-y-0">
                {TIMELINE_STEPS.map((step, i) => {
                  const isDone = i <= currentStep;
                  const isCurrent = i === currentStep;
                  return (
                    <div key={step.status} className="flex gap-4">
                      {/* Icon + line */}
                      <div className="flex flex-col items-center">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          isDone ? 'bg-primary text-white' : 'bg-gray-100 text-light-gray'
                        } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                          {step.icon}
                        </div>
                        {i < TIMELINE_STEPS.length - 1 && (
                          <div className={`w-0.5 h-10 mt-1 ${isDone ? 'bg-primary' : 'bg-gray-100'}`} />
                        )}
                      </div>
                      {/* Content */}
                      <div className="pb-8 pt-1.5">
                        <p className={`font-semibold text-sm ${isDone ? 'text-navy' : 'text-light-gray'}`}>
                          {step.label}
                        </p>
                        <p className="text-xs text-mid-gray mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
              <p className="text-red-600 font-semibold">Đơn hàng đã bị hủy</p>
            </div>
          )}

          {/* Items */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <h2 className="font-semibold text-navy mb-4">Sản phẩm</h2>
            <div className="space-y-3">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-xl shrink-0">🛍️</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy truncate">{item.productName}</p>
                    <p className="text-xs text-mid-gray">{item.variantName} × {item.quantity}</p>
                  </div>
                  <span className="font-bold text-navy text-sm shrink-0">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Shipping address */}
          <div className="bg-white rounded-2xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-navy text-sm">Địa chỉ giao hàng</h3>
            </div>
            <div className="text-sm text-mid-gray space-y-0.5">
              <p className="font-semibold text-navy">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
              <p>{order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Total */}
          <div className="bg-white rounded-2xl border border-border p-4">
            <h3 className="font-semibold text-navy text-sm mb-3">Tổng đơn hàng</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-mid-gray">
                <span>{order.orderItems.length} sản phẩm</span>
                <span className="font-medium text-navy">{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-mid-gray">
                <span>Vận chuyển</span>
                <span className="text-green-600 font-medium">Miễn phí</span>
              </div>
              <div className="flex justify-between font-bold text-navy border-t border-border pt-2">
                <span>Tổng cộng</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
