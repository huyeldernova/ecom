export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export type InventoryModalMode = 'restock' | 'edit' | 'add';

export interface InventoryItem {
  pid: string;          // product variant id
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  reservedQuantity: number;
  threshold: number;    // low stock threshold
  sold7: number;        // units sold in last 7 days
  status: StockStatus;
}

export interface RestockRequest {
  quantity: number;
  reason: string;
}

export interface InventoryFilterRequest {
  name?: string;
  category?: string;
  status?: StockStatus;
  page?: number;
  size?: number;
}

export interface InventoryKPIs {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}
