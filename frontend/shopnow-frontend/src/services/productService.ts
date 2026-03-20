import { productApi } from './api';
import { ApiResponse, PageResponse } from '@/types/common.types';
import {
  Product,
  ProductFilterRequest,
  ProductSummary,
  ProductVariant,
} from '@/types/product.types';
import { MOCK_PRODUCTS } from '@/lib/mockData/products.mock';

export const productService = {
  // ─── Lấy danh sách sản phẩm (có filter + pagination) ────
  getAll: async (
    filter: ProductFilterRequest
  ): Promise<PageResponse<ProductSummary>> => {
    // ✅ Phase 3:
    // const res = await productApi.get<ApiResponse<PageResponse<ProductSummary>>>(
    //   '/api/v1/products', { params: filter }
    // );
    // return res.data.data;

    // 🔶 Phase 1-2 mock:
    await new Promise((r) => setTimeout(r, 400));
    const page = filter.page ?? 0;
    const size = filter.size ?? 12;
    let results = [...MOCK_PRODUCTS];

    // Filter theo category
    if (filter.category) {
      results = results.filter((p) =>
        p.category.toLowerCase() === filter.category!.toLowerCase()
      );
    }
    // Filter theo name
    if (filter.name) {
      results = results.filter((p) =>
        p.name.toLowerCase().includes(filter.name!.toLowerCase())
      );
    }
    // Filter theo price
    if (filter.minPrice !== undefined) {
      results = results.filter((p) => p.minPrice >= filter.minPrice!);
    }
    if (filter.maxPrice !== undefined) {
      results = results.filter((p) => p.maxPrice <= filter.maxPrice!);
    }

    const start = page * size;
    return {
      currentPage: page,
      pageSize: size,
      totalPages: Math.ceil(results.length / size),
      totalElements: results.length,
      result: results.slice(start, start + size),
    };
  },

  // ─── Lấy chi tiết sản phẩm theo ID ──────────────────────
  getById: async (id: string): Promise<Product> => {
    // ✅ Phase 3:
    // const res = await productApi.get<ApiResponse<Product>>(`/api/v1/products/${id}`);
    // return res.data.data;

    // 🔶 Phase 1-2 mock:
    await new Promise((r) => setTimeout(r, 300));
    const product = MOCK_PRODUCTS.find((p) => p.id === id);
    if (!product) throw new Error(`Product ${id} not found`);
    return product;
  },

  // ─── Lấy variant theo ID ─────────────────────────────────
  getVariantById: async (variantId: string): Promise<ProductVariant> => {
    // ✅ Phase 3:
    // const res = await productApi.get<ApiResponse<ProductVariant>>(
    //   `/api/v1/products/variants/${variantId}`
    // );
    // return res.data.data;

    // 🔶 Phase 1-2 mock:
    for (const p of MOCK_PRODUCTS) {
      const variant = p.variants.find((v) => v.id === variantId);
      if (variant) return variant;
    }
    throw new Error(`Variant ${variantId} not found`);
  },

  // ─── Lấy danh sách categories ───────────────────────────
  getCategories: async (): Promise<string[]> => {
    // ✅ Phase 3:
    // const res = await productApi.get<ApiResponse<string[]>>('/api/v1/products/categories');
    // return res.data.data;

    // 🔶 Phase 1-2 mock:
    return [...new Set(MOCK_PRODUCTS.map((p) => p.category))];
  },
};
