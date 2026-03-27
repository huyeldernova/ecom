import { productApi } from './api';
import { ApiResponse } from '@/types/common.types';

export interface CategoryPayload {
  name: string;
  description?: string;
  displayOrder?: number;
  parentId?: string;
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

// ─── Response type trả về từ backend /api/v1/files ───────
export interface FileMetaDataResponse {
  name: string;
  contentType: string;
  size: number;
  url: string;
  displayOrder: number;
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

  // ─── Upload files lên S3 ─────────────────────────────────
  // Gọi POST /product/api/v1/files với multipart/form-data
  // Backend nhận @RequestParam List<MultipartFile> files
  uploadFiles: async (files: File[]): Promise<FileMetaDataResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const res = await productApi.post<ApiResponse<FileMetaDataResponse[]>>(
      '/api/v1/files',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
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