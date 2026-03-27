import { inventoryApi, productApi } from './api';
import { ApiResponse, PageResponse } from '@/types/common.types';
import { InventoryFilterRequest, InventoryItem, InventoryKPIs, RestockRequest } from '@/types/inventory.types';

export const inventoryService = {
  getAll: async (filter: InventoryFilterRequest): Promise<PageResponse<InventoryItem>> => {
    const params: Record<string, any> = {
      page: filter.page ?? 0,
      size: filter.size ?? 10,
    };
    if (filter.status) params.status = filter.status;

    const res = await inventoryApi.get<ApiResponse<PageResponse<InventoryItem>>>(
      '/api/inventories', { params }
    );
    const data = res.data.data;

    // ✅ Enrich với product info từ ProductService
    const enriched = await Promise.all(
      data.result.map(async (item: any) => {
        try {
          const productRes = await productApi.get<ApiResponse<any>>(
            `/api/v1/products/variants/${item.productVariantId}`
          );
          const variant = productRes.data.data;
          return {
            ...item,
            pid: item.productVariantId,
            name: variant.productName ?? '—',
            sku: variant.sku ?? '—',
            price: variant.effectivePrice ?? variant.finalPrice ?? 0,
            category: variant.categoryName ?? '—',
          };
        } catch {
          return {
            ...item,
            pid: item.productVariantId,
            name: '—',
            sku: '—',
            price: 0,
          };
        }
      })
    );

    return { ...data, result: enriched };
  },

  getKPIs: async (): Promise<InventoryKPIs> => {
    const res = await inventoryApi.get<ApiResponse<InventoryKPIs>>('/api/inventories/kpis');
    return res.data.data;
  },

  restock: async (pid: string, req: RestockRequest): Promise<void> => {
    await inventoryApi.post(`/api/inventories/${pid}/import`, req);
  },

  updateProduct: async (pid: string, data: Partial<InventoryItem>): Promise<void> => {
    await productApi.patch(`/api/v1/products/${pid}`, data);
  },
};