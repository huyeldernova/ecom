export interface CartItem {
  id: string;
  productId: string;
  productVariantId: string;
  productName: string;
  variantName: string;
  imageUrl?: string;
  quantity: number;
  snapshotPrice: number;
}

export interface Cart {
  id: string;
  userId: string;
  cartItems: CartItem[];
  totalAmount: number;
}

export interface AddItemRequest {
  productId: string;
  productVariantId: string;
  quantity: number;
}

export interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: () => number;
  itemCount: () => number;
}
