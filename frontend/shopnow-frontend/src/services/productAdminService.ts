// frontend/shopnow-frontend/src/services/productAdminService.ts
import { productApi, fileApi } from './api';  // ← thêm fileApi
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
  fileIds?: string[];      // ← THÊM: để gửi lên productService link với FileService
  variants: VariantPayload[];
}

// ─── Cập nhật interface khớp với FileResponse mới ────────
export interface FileResponse {
  id: string;              // UUID — cần để link sau khi tạo product
  name: string;
  contentType: string;
  size: number;
  url: string;
  targetType: string | null;
  targetId: string | null;
  createdAt: string;
  // displayOrder đã bị xóa — field này chỉ có ở productService cũ
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

  // ─── Upload files lên FileService (port 8087) ────────────
  uploadFiles: async (files: File[]): Promise<FileResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const res = await fileApi.post<ApiResponse<FileResponse[]>>(   // ← fileApi thay vì productApi
      '/api/v1/files',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
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