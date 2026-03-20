import { ShippingAddress } from './common.types';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  productVariantId: string;
  productName: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  clientSecret?: string; // chỉ có khi tạo mới — dùng cho Stripe
  shippingAddress: ShippingAddress;
  note?: string;
  orderItems: OrderItem[];
  createdAt: string;
}

export interface CreateOrderRequest {
  shippingAddress: ShippingAddress;
  note?: string;
}

export type ShippingMethod = 'standard' | 'express' | 'overnight';

export interface ShippingOption {
  id: ShippingMethod;
  label: string;
  description: string;
  price: number;
  estimatedDays: string;
}
