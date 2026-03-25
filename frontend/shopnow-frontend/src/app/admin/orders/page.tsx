'use client';

import { useState, useEffect } from 'react';
import { orderService } from '@/services/orderService';
import { Order, OrderStatus } from '@/types/order.types';
import { formatPrice } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

const STATUS_OPTIONS: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  SHIPPING: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

// ─── Valid transitions ────────────────────────────────────
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING:   ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPING',  'CANCELLED'],
  SHIPPING:  ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getAllOrders(0, 50);
      setOrders(res.result);
    } catch {
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      await orderService.updateStatus(orderId, newStatus);
      toast.success('Cập nhật trạng thái thành công');
      loadOrders();
    } catch {
      toast.error('Cập nhật thất bại');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-head font-bold text-2xl text-navy">Quản lý đơn hàng</h1>
        <p className="text-mid-gray text-sm mt-1">Xem và cập nhật trạng thái đơn hàng</p>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                {['Mã đơn', 'Khách hàng', 'Sản phẩm', 'Tổng tiền', 'Trạng thái', 'Cập nhật'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-mid-gray uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-mid-gray">
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  {/* Mã đơn */}
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs font-semibold text-navy">
                      #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-mid-gray mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </td>

                  {/* Khách hàng */}
                  <td className="px-4 py-3 text-sm text-navy">
                    <p className="font-medium">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </p>
                    <p className="text-xs text-mid-gray">{order.shippingAddress.phone}</p>
                  </td>

                  {/* Sản phẩm */}
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      {order.orderItems.slice(0, 2).map((item) => (
                        <p key={item.id} className="text-xs text-mid-gray">
                          {item.productName} × {item.quantity}
                        </p>
                      ))}
                      {order.orderItems.length > 2 && (
                        <p className="text-xs text-light-gray">
                          +{order.orderItems.length - 2} sản phẩm khác
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Tổng tiền */}
                  <td className="px-4 py-3">
                    <span className="font-bold text-navy text-sm">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </td>

                  {/* Trạng thái */}
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </td>

                  {/* Cập nhật */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updating === order.id || order.status === 'DELIVERED' || order.status === 'CANCELLED'}
                        className="text-xs border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value={order.status}>{order.status}</option>
                        {VALID_TRANSITIONS[order.status].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {updating === order.id && (
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}