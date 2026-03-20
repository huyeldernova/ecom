import { orderApi } from './api';
import { ApiResponse, PageResponse } from '@/types/common.types';
import { CreateOrderRequest, Order } from '@/types/order.types';
import { MOCK_ORDERS } from '@/lib/mockData/orders.mock';

export const orderService = {
  // ─── Tạo order mới ──────────────────────────────────────
  createOrder: async (req: CreateOrderRequest): Promise<Order> => {
    // ✅ Phase 3:
    // const res = await orderApi.post<ApiResponse<Order>>('/api/v1/orders', req);
    // return res.data.data; // response có clientSecret cho Stripe

    // 🔶 Phase 1-2 mock:
    await new Promise((r) => setTimeout(r, 800));
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      userId: 'mock-user-id',
      status: 'PENDING',
      totalAmount: 0,
      clientSecret: 'mock_client_secret_for_stripe',
      shippingAddress: req.shippingAddress,
      note: req.note,
      orderItems: [],
      createdAt: new Date().toISOString(),
    };
    return newOrder;
  },

  // ─── Lấy danh sách orders của user ──────────────────────
  getOrders: async (
    page = 0,
    size = 10
  ): Promise<PageResponse<Order>> => {
    // ✅ Phase 3:
    // const res = await orderApi.get<ApiResponse<PageResponse<Order>>>(
    //   '/api/v1/orders', { params: { page, size } }
    // );
    // return res.data.data;

    // 🔶 Phase 1-2 mock:
    await new Promise((r) => setTimeout(r, 400));
    return {
      currentPage: page,
      pageSize: size,
      totalPages: 1,
      totalElements: MOCK_ORDERS.length,
      result: MOCK_ORDERS,
    };
  },

  // ─── Lấy chi tiết order ─────────────────────────────────
  getOrderById: async (id: string): Promise<Order> => {
    // ✅ Phase 3:
    // const res = await orderApi.get<ApiResponse<Order>>(`/api/v1/orders/${id}`);
    // return res.data.data;

    // 🔶 Phase 1-2 mock:
    await new Promise((r) => setTimeout(r, 300));
    const order = MOCK_ORDERS.find((o) => o.id === id);
    if (!order) throw new Error(`Order ${id} not found`);
    return order;
  },

  // ─── Hủy order ──────────────────────────────────────────
  cancelOrder: async (id: string): Promise<void> => {
    // ✅ Phase 3:
    // await orderApi.patch(`/api/v1/orders/${id}/cancel`);

    // 🔶 Phase 1-2 mock:
    await new Promise((r) => setTimeout(r, 500));
  },
};
