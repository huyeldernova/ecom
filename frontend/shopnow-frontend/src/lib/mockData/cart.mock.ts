import { CartItem } from '@/types/cart.types';

// Dùng để seed cartStore khi dev/test
// Import và gọi useCartStore.setState({ items: MOCK_CART_ITEMS }) trong dev tools
export const MOCK_CART_ITEMS: CartItem[] = [
  {
    id: 'ci-001',
    productId: 'p001',
    productVariantId: 'v001a',
    productName: 'Sony WH-1000XM5 Wireless Headphones',
    variantName: 'Black',
    imageUrl: 'https://picsum.photos/400/400?random=1',
    quantity: 1,
    snapshotPrice: 349,
  },
  {
    id: 'ci-002',
    productId: 'p012',
    productVariantId: 'v012a',
    productName: 'Atomic Habits',
    variantName: 'Paperback',
    imageUrl: 'https://picsum.photos/400/400?random=13',
    quantity: 2,
    snapshotPrice: 14,
  },
  {
    id: 'ci-003',
    productId: 'p004',
    productVariantId: 'v004c',
    productName: 'Nike Air Max 270 React',
    variantName: 'Black / Size 40',
    imageUrl: 'https://picsum.photos/400/400?random=5',
    quantity: 1,
    snapshotPrice: 129,
  },
];
