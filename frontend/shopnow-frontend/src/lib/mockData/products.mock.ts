import { Product, ProductSummary } from '@/types/product.types';

export const MOCK_PRODUCTS: Product[] = [
  // ─── Electronics ─────────────────────────────────────────
  {
    id: 'p001',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Industry-leading noise canceling headphones with 30-hour battery life, crystal clear hands-free calling, and Alexa voice control.',
    category: 'Electronics',
    imageUrl: 'https://picsum.photos/400/400?random=1',
    createdAt: '2024-01-15T08:00:00Z',
    variants: [
      { id: 'v001a', variantName: 'Black', price: 399, discountPrice: 349, isActive: true, imageUrl: 'https://picsum.photos/400/400?random=1' },
      { id: 'v001b', variantName: 'Silver', price: 399, isActive: true, imageUrl: 'https://picsum.photos/400/400?random=2' },
    ],
  },
  {
    id: 'p002',
    name: 'Apple iPad Pro 12.9" M2',
    description: 'Supercharged by the next-generation M2 chip. The ultimate iPad experience with Liquid Retina XDR display.',
    category: 'Electronics',
    imageUrl: 'https://picsum.photos/400/400?random=3',
    createdAt: '2024-01-20T08:00:00Z',
    variants: [
      { id: 'v002a', variantName: '128GB WiFi', price: 1099, isActive: true },
      { id: 'v002b', variantName: '256GB WiFi', price: 1299, isActive: true },
      { id: 'v002c', variantName: '512GB WiFi + Cellular', price: 1699, isActive: true },
    ],
  },
  {
    id: 'p003',
    name: 'Samsung 4K OLED Smart TV 55"',
    description: 'Experience breathtaking picture quality with Samsung OLED technology. Smart TV with built-in streaming apps.',
    category: 'Electronics',
    imageUrl: 'https://picsum.photos/400/400?random=4',
    createdAt: '2024-02-01T08:00:00Z',
    variants: [
      { id: 'v003a', variantName: '55 inch', price: 1499, discountPrice: 1299, isActive: true },
      { id: 'v003b', variantName: '65 inch', price: 1999, discountPrice: 1799, isActive: true },
    ],
  },

  // ─── Fashion ──────────────────────────────────────────────
  {
    id: 'p004',
    name: 'Nike Air Max 270 React',
    description: 'Combining two of Nike\'s most innovative technologies for unrivaled cushioning and style.',
    category: 'Fashion',
    imageUrl: 'https://picsum.photos/400/400?random=5',
    createdAt: '2024-01-10T08:00:00Z',
    variants: [
      { id: 'v004a', variantName: 'White / Size 40', price: 150, isActive: true },
      { id: 'v004b', variantName: 'White / Size 41', price: 150, isActive: true },
      { id: 'v004c', variantName: 'Black / Size 40', price: 150, discountPrice: 129, isActive: true },
      { id: 'v004d', variantName: 'Black / Size 41', price: 150, discountPrice: 129, isActive: true },
    ],
  },
  {
    id: 'p005',
    name: 'Levi\'s 511 Slim Fit Jeans',
    description: 'A versatile slim fit that sits below the waist. Made with stretch denim for all-day comfort.',
    category: 'Fashion',
    imageUrl: 'https://picsum.photos/400/400?random=6',
    createdAt: '2024-01-25T08:00:00Z',
    variants: [
      { id: 'v005a', variantName: 'Dark Blue / W30 L32', price: 69, isActive: true },
      { id: 'v005b', variantName: 'Dark Blue / W32 L32', price: 69, isActive: true },
      { id: 'v005c', variantName: 'Light Blue / W30 L32', price: 69, isActive: true },
    ],
  },

  // ─── Sports ───────────────────────────────────────────────
  {
    id: 'p006',
    name: 'Garmin Forerunner 955 GPS Watch',
    description: 'GPS running and triathlon smartwatch with advanced training features, heart rate monitoring, and 15-day battery life.',
    category: 'Sports',
    imageUrl: 'https://picsum.photos/400/400?random=7',
    createdAt: '2024-02-05T08:00:00Z',
    variants: [
      { id: 'v006a', variantName: 'Black', price: 499, discountPrice: 449, isActive: true },
      { id: 'v006b', variantName: 'White', price: 499, isActive: true },
    ],
  },
  {
    id: 'p007',
    name: 'Adjustable Dumbbell Set 5-52.5 lbs',
    description: 'Replace 15 sets of weights with one set. Quick weight selection from 5 to 52.5 pounds.',
    category: 'Sports',
    imageUrl: 'https://picsum.photos/400/400?random=8',
    createdAt: '2024-02-10T08:00:00Z',
    variants: [
      { id: 'v007a', variantName: 'Single', price: 179, isActive: true },
      { id: 'v007b', variantName: 'Pair', price: 329, discountPrice: 299, isActive: true },
    ],
  },

  // ─── Home ─────────────────────────────────────────────────
  {
    id: 'p008',
    name: 'Dyson V15 Detect Cordless Vacuum',
    description: 'Reveals and captures microscopic dust. Automatically adapts suction to different floor types.',
    category: 'Home',
    imageUrl: 'https://picsum.photos/400/400?random=9',
    createdAt: '2024-01-30T08:00:00Z',
    variants: [
      { id: 'v008a', variantName: 'Yellow / Nickel', price: 749, discountPrice: 699, isActive: true },
      { id: 'v008b', variantName: 'Submarine Blue', price: 749, isActive: true },
    ],
  },
  {
    id: 'p009',
    name: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker',
    description: 'Combines 7 appliances in 1: pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, and warmer.',
    category: 'Home',
    imageUrl: 'https://picsum.photos/400/400?random=10',
    createdAt: '2024-02-08T08:00:00Z',
    variants: [
      { id: 'v009a', variantName: '3 Quart', price: 79, isActive: true },
      { id: 'v009b', variantName: '6 Quart', price: 99, discountPrice: 89, isActive: true },
      { id: 'v009c', variantName: '8 Quart', price: 119, isActive: true },
    ],
  },

  // ─── Beauty ───────────────────────────────────────────────
  {
    id: 'p010',
    name: 'La Mer Crème de la Mer Moisturizing Cream',
    description: 'The legendary moisturizer that started it all. Intensely hydrates and helps visibly transform skin.',
    category: 'Beauty',
    imageUrl: 'https://picsum.photos/400/400?random=11',
    createdAt: '2024-01-18T08:00:00Z',
    variants: [
      { id: 'v010a', variantName: '15ml', price: 95, isActive: true },
      { id: 'v010b', variantName: '30ml', price: 175, discountPrice: 159, isActive: true },
      { id: 'v010c', variantName: '60ml', price: 310, isActive: true },
    ],
  },
  {
    id: 'p011',
    name: 'Dyson Airwrap Multi-styler Complete',
    description: 'Styles and dries simultaneously with no extreme heat. Includes attachments for curls, waves, and smoothing.',
    category: 'Beauty',
    imageUrl: 'https://picsum.photos/400/400?random=12',
    createdAt: '2024-02-12T08:00:00Z',
    variants: [
      { id: 'v011a', variantName: 'Nickel / Copper', price: 599, isActive: true },
      { id: 'v011b', variantName: 'Prussian Blue / Rich Copper', price: 599, discountPrice: 549, isActive: true },
    ],
  },

  // ─── Books ────────────────────────────────────────────────
  {
    id: 'p012',
    name: 'Atomic Habits by James Clear',
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. The definitive guide to habit formation.',
    category: 'Books',
    imageUrl: 'https://picsum.photos/400/400?random=13',
    createdAt: '2024-01-05T08:00:00Z',
    variants: [
      { id: 'v012a', variantName: 'Paperback', price: 18, discountPrice: 14, isActive: true },
      { id: 'v012b', variantName: 'Hardcover', price: 28, isActive: true },
      { id: 'v012c', variantName: 'Kindle Edition', price: 10, isActive: true },
    ],
  },
  {
    id: 'p013',
    name: 'The Psychology of Money by Morgan Housel',
    description: 'Timeless lessons on wealth, greed, and happiness. 19 short stories exploring the relationship between people and money.',
    category: 'Books',
    imageUrl: 'https://picsum.photos/400/400?random=14',
    createdAt: '2024-01-22T08:00:00Z',
    variants: [
      { id: 'v013a', variantName: 'Paperback', price: 16, isActive: true },
      { id: 'v013b', variantName: 'Hardcover', price: 24, discountPrice: 20, isActive: true },
    ],
  },
  {
    id: 'p014',
    name: 'Logitech MX Master 3S Wireless Mouse',
    description: 'Advanced wireless mouse with ultra-fast scrolling, quiet clicks, and ergonomic design for all-day comfort.',
    category: 'Electronics',
    imageUrl: 'https://picsum.photos/400/400?random=15',
    createdAt: '2024-02-15T08:00:00Z',
    variants: [
      { id: 'v014a', variantName: 'Graphite', price: 99, discountPrice: 89, isActive: true },
      { id: 'v014b', variantName: 'Pale Grey', price: 99, isActive: true },
    ],
  },
];

// ─── ProductSummary list (dùng cho product list page) ────
export const MOCK_PRODUCT_SUMMARIES: ProductSummary[] = MOCK_PRODUCTS.map(
  (p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    imageUrl: p.imageUrl,
    minPrice: Math.min(...p.variants.map((v) => v.discountPrice ?? v.price)),
    maxPrice: Math.max(...p.variants.map((v) => v.price)),
  })
);

// ─── Categories list ─────────────────────────────────────
export const MOCK_CATEGORIES = [
  { id: 'electronics', label: 'Electronics', emoji: '💻' },
  { id: 'fashion', label: 'Fashion', emoji: '👗' },
  { id: 'sports', label: 'Sports', emoji: '🏋️' },
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'beauty', label: 'Beauty', emoji: '✨' },
  { id: 'books', label: 'Books', emoji: '📚' },
];
