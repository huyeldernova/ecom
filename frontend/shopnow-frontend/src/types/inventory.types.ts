export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
export type InventoryModalMode = 'restock' | 'edit' | 'add';

export interface InventoryItem {
  pid: string;
  name?: string;
  sku?: string;
  category?: string;
  price?: number;
  stock: number;
  reservedQuantity: number;
  availableQuantity: number;
  threshold: number;
  sold7: number;
  status: StockStatus;
}

export interface RestockRequest {
  quantity: number;
  reason: string;
}

export interface InventoryFilterRequest {
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