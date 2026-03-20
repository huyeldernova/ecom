import { inventoryApi } from './api';
import { ApiResponse, PageResponse } from '@/types/common.types';
import {
  InventoryFilterRequest,
  InventoryItem,
  InventoryKPIs,
  RestockRequest,
} from '@/types/inventory.types';
import { MOCK_INVENTORY } from '@/lib/mockData/inventory.mock';

export const inventoryService = {
  // ─── Lấy danh sách inventory ─────────────────────────────
  getAll: async (
    filter: InventoryFilterRequest
  ): Promise<PageResponse<InventoryItem>> => {
    // ✅ Phase 3:
    // const res = await inventoryApi.get<ApiResponse<PageResponse<InventoryItem>>>(
    //   '/api/inventories', { params: filter }
    // );
    // return res.data.data;

    // 🔶 Phase 1-2 mock:
    await new Promise((r) => setTimeout(r, 400));
    let results = [...MOCK_INVENTORY];
    const page = filter.page ?? 0;
    const size = filter.size ?? 10;

    if (filter.name) {
      results = results.filter((i) =>
        i.name.toLowerCase().includes(filter.name!.toLowerCase())
      );
    }
    if (filter.category) {
      results = results.filter((i) => i.category === filter.category);
    }
    if (filter.status) {
      results = results.filter((i) => i.status === filter.status);
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

  // ─── Lấy KPI summary ────────────────────────────────────
  getKPIs: async (): Promise<InventoryKPIs> => {
    // ✅ Phase 3:
    // const res = await inventoryApi.get<ApiResponse<InventoryKPIs>>('/api/inventories/kpis');
    // return res.data.data;

    // 🔶 Phase 1-2 mock:
    return {
      totalProducts: MOCK_INVENTORY.length,
      inStock: MOCK_INVENTORY.filter((i) => i.status === 'IN_STOCK').length,
      lowStock: MOCK_INVENTORY.filter((i) => i.status === 'LOW_STOCK').length,
      outOfStock: MOCK_INVENTORY.filter((i) => i.status === 'OUT_OF_STOCK').length,
    };
  },

  // ─── Restock sản phẩm ───────────────────────────────────
  restock: async (pid: string, req: RestockRequest): Promise<void> => {
    // ✅ Phase 3:
    // await inventoryApi.post(`/api/inventories/${pid}/import`, req);

    // 🔶 Phase 1-2 mock:
    await new Promise((r) => setTimeout(r, 600));
  },

  // ─── Cập nhật thông tin sản phẩm ────────────────────────
  updateProduct: async (
    pid: string,
    data: Partial<InventoryItem>
  ): Promise<void> => {
    // ✅ Phase 3:
    // await inventoryApi.patch(`/api/v1/products/${pid}`, data);

    // 🔶 Phase 1-2 mock:
    await new Promise((r) => setTimeout(r, 500));
  },
};
