export interface ProductVariant {
  id: string;
  variantName: string;
  price: number;
  discountPrice?: number;
  isActive: boolean;
  imageUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  variants: ProductVariant[];
  createdAt: string;
}

export interface ProductSummary {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  minPrice: number;
  maxPrice: number;
}

export interface ProductFilterRequest {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export type ProductSortOption =
  | 'newest'
  | 'price_asc'
  | 'price_desc'
  | 'popular';
