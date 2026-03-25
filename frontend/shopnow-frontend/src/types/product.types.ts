export interface ProductVariant {
  id: string;
  sku: string;
  size?: string;
  color?: string;
  variantName: string;
  finalPrice?: number;
  effectivePrice: number;
  isActive: boolean;
  imageUrls?: string[];
  productName?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  brand: string;
  price: number;
  thumbnailUrl?: string;
  imageUrls?: string[];
  status: string;
  categoryId: string;
  variants: ProductVariant[];
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  thumbnailUrl?: string;
  status: string;
  categoryId: string;
}

export interface ProductFilterRequest {
  name?: string;
  brand?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
}