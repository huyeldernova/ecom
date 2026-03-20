'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, ChevronRight, X } from 'lucide-react';
import { MOCK_ORDERS } from '@/lib/mockData/orders.mock';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { OrderStatus } from '@/types/order.types';

const STATUS_FILTERS: { value: OrderStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ xử lý' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'SHIPPING', label: 'Đang giao' },
  { value: 'DELIVERED', label: 'Đã giao' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const MyOrders = () => {
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');

  const orders = filter === 'ALL'
    ? MOCK_ORDERS
    : MOCK_ORDERS.filter((o) => o.status === filter);

  const handleCancel = async (id: string) => {
    await new Promise((r) => setTimeout(r, 500));
    toast.success(`Đã hủy đơn hàng #${id.slice(-6).toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-head font-bold text-xl text-navy">Đơn hàng của tôi</h2>
        <p className="text-mid-gray text-sm mt-1">{MOCK_ORDERS.length} đơn hàng</p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
              filter === f.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-mid-gray hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {orders.length === 0 ? (
        <div className="text-center py-12 text-mid-gray">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Không có đơn hàng nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-border p-4 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-mid-gray">Mã đơn hàng</span>
                  <p className="font-semibold text-navy text-sm">
                    #{order.id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              {/* Items preview */}
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {order.orderItems.slice(0, 3).map((item, i) => (
                    <div key={i} className="w-12 h-12 rounded-lg bg-background border border-border flex items-center justify-center text-xl">
                      🛍️
                    </div>
                  ))}
                  {order.orderItems.length > 3 && (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-semibold text-mid-gray">
                      +{order.orderItems.length - 3}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-navy truncate">
                    {order.orderItems[0]?.productName}
                    {order.orderItems.length > 1 && ` và ${order.orderItems.length - 1} sản phẩm khác`}
                  </p>
                  <p className="text-xs text-mid-gray mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="font-bold text-navy">{formatPrice(order.totalAmount)}</span>
                <div className="flex items-center gap-2">
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-3 h-3" /> Hủy
                    </button>
                  )}
                  <Link
                    href={`/orders/${order.id}`}
                    className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                  >
                    Chi tiết <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
