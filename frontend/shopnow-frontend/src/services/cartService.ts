// import { cartApi } from './api';
// import { ApiResponse } from '@/types/common.types';
// import { AddItemRequest, Cart } from '@/types/cart.types';
//
// export const cartService = {
//   // ─── Lấy cart của user hiện tại ─────────────────────────
//   getCart: async (): Promise<Cart> => {
//     // ✅ Phase 3:
//     // const res = await cartApi.get<ApiResponse<Cart>>('/api/v1/cart');
//     // return res.data.data;
//
//     // 🔶 Phase 1-2: cartStore đã handle local state, không cần gọi API
//     throw new Error('Use cartStore for Phase 1-2');
//   },
//
//   // ─── Thêm item vào cart ──────────────────────────────────
//   addItem: async (req: AddItemRequest): Promise<Cart> => {
//     // ✅ Phase 3:
//     // const res = await cartApi.post<ApiResponse<Cart>>('/api/v1/cart/items', req);
//     // return res.data.data;
//
//     // 🔶 Phase 1-2: dùng cartStore.addItem() thay thế
//     throw new Error('Use cartStore.addItem() for Phase 1-2');
//   },
//
//   // ─── Cập nhật quantity ───────────────────────────────────
//   updateItem: async (itemId: string, quantity: number): Promise<Cart> => {
//     // ✅ Phase 3:
//     // const res = await cartApi.patch<ApiResponse<Cart>>(
//     //   `/api/v1/cart/items/${itemId}`, { quantity }
//     // );
//     // return res.data.data;
//
//     throw new Error('Use cartStore.updateQuantity() for Phase 1-2');
//   },
//
//   // ─── Xóa item ────────────────────────────────────────────
//   removeItem: async (itemId: string): Promise<void> => {
//     // ✅ Phase 3:
//     // await cartApi.delete(`/api/v1/cart/items/${itemId}`);
//
//     throw new Error('Use cartStore.removeItem() for Phase 1-2');
//   },
//
//   // ─── Xóa toàn bộ cart ───────────────────────────────────
//   clearCart: async (): Promise<void> => {
//     // ✅ Phase 3: await cartApi.delete('/api/v1/cart');
//
//     throw new Error('Use cartStore.clearCart() for Phase 1-2');
//   },
// };
import { cartApi } from './api';
import { ApiResponse } from '@/types/common.types';
import { AddItemRequest, Cart } from '@/types/cart.types';

export const cartService = {
  // ─── Lấy cart ────────────────────────────────────────────
  getCart: async (): Promise<Cart> => {
    const res = await cartApi.get<ApiResponse<Cart>>('/api/v1/cart');
    return res.data.data;
  },

  // ─── Thêm item ───────────────────────────────────────────
  addItem: async (req: AddItemRequest): Promise<Cart> => {
    const res = await cartApi.post<ApiResponse<Cart>>('/api/v1/cart/items', req);
    return res.data.data;
  },

  // ─── Cập nhật quantity — ✅ fix endpoint /items/{id}/quantity
  updateItem: async (itemId: string, quantity: number): Promise<Cart> => {
    const res = await cartApi.patch<ApiResponse<Cart>>(
      `/api/v1/cart/items/${itemId}/quantity`,
      { quantity }
    );
    return res.data.data;
  },

  // ─── Xóa item ────────────────────────────────────────────
  removeItem: async (itemId: string): Promise<void> => {
    await cartApi.delete(`/api/v1/cart/items/${itemId}`);
  },

  // ─── Xóa toàn bộ cart ───────────────────────────────────
  clearCart: async (): Promise<void> => {
    await cartApi.delete('/api/v1/cart');
  },
};