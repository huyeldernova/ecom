
import { orderApi } from './api';
import { ApiResponse, PageResponse } from '@/types/common.types';
import { CreateOrderRequest, Order } from '@/types/order.types';

export const orderService = {
  createOrder: async (req: CreateOrderRequest): Promise<Order> => {
    const res = await orderApi.post<ApiResponse<Order>>('/api/v1/orders', req);
    return res.data.data;
  },

  checkout: async (orderId: string): Promise<Order> => {
    const res = await orderApi.post<ApiResponse<Order>>(`/api/v1/orders/${orderId}/checkout`);
    return res.data.data;
  },

  getOrders: async (page = 0, size = 10): Promise<PageResponse<Order>> => {
    const res = await orderApi.get<ApiResponse<PageResponse<Order>>>(
      '/api/v1/orders', { params: { page, size } }
    );
    return res.data.data;
  },

  getOrderById: async (id: string): Promise<Order> => {
    const res = await orderApi.get<ApiResponse<Order>>(`/api/v1/orders/${id}`);
    return res.data.data;
  },

updateStatus: async (orderId: string, status: string): Promise<void> => {
  await orderApi.patch(
    `/api/v1/orders/internal/${orderId}/status`,
    { status },
    { headers: { 'X-Internal-Key': 'super-secret-internal-key-123' } }
  );
},

  cancelOrder: async (id: string): Promise<void> => {
    await orderApi.post(`/api/v1/orders/${id}/cancel`);
  },

  getAllOrders: async (page = 0, size = 50): Promise<PageResponse<Order>> => {
    const res = await orderApi.get<ApiResponse<PageResponse<Order>>>(
      '/api/v1/orders/admin', { params: { page, size } }
    );
    return res.data.data;
  },
};