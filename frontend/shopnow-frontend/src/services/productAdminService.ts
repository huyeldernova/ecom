import { productApi } from './api';
import { ApiResponse } from '@/types/common.types';

export interface CategoryPayload {
  name: string;
  description?: string;
  displayOrder?: number;
  parentId?: string
}

export interface VariantPayload {
  sku?: string;
  size?: string;
  color?: string;
  finalPrice: number;
}

export interface ProductPayload {
  name: string;
  brand: string;
  price: number;
  categoryId: string;
  description?: string;
  thumbnailUrl?: string;
  variants: VariantPayload[];
}

export const productAdminService = {
  // ─── Categories ──────────────────────────────────────────
  getCategories: async () => {
    const res = await productApi.get<ApiResponse<any[]>>('/api/v1/categories/tree');
    return res.data.data;
  },

  createCategory: async (payload: CategoryPayload) => {
    const res = await productApi.post<ApiResponse<any>>('/api/v1/categories', payload);
    return res.data.data;
  },

  // ─── Products ────────────────────────────────────────────
  createProduct: async (payload: ProductPayload) => {
    const res = await productApi.post<ApiResponse<any>>('/api/v1/products', payload);
    return res.data.data;
  },

  deleteProduct: async (id: string) => {
    await productApi.delete(`/api/v1/products/${id}`);
  },
};