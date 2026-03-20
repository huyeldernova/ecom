import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, CartStore } from '@/types/cart.types';

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [] as CartItem[],

      // Thêm item — nếu đã có thì tăng quantity
      addItem: (item: CartItem) => {
        const existing = get().items.find(
          (i) => i.productVariantId === item.productVariantId
        );
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.productVariantId === item.productVariantId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },

      // Xóa item theo id
      removeItem: (id: string) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      // Cập nhật quantity — nếu qty <= 0 thì xóa luôn
      updateQuantity: (id: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        });
      },

      // Xóa toàn bộ cart
      clearCart: () => set({ items: [] }),

      // Tính tổng tiền
      totalAmount: () =>
        get().items.reduce(
          (sum, item) => sum + item.snapshotPrice * item.quantity,
          0
        ),

      // Tổng số lượng items
      itemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'shopnow-cart',
    }
  )
);
