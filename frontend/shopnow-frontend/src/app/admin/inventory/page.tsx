'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, RefreshCw, Edit, PackagePlus } from 'lucide-react';
import { inventoryService } from '@/services/inventoryService';
import { InventoryItem, InventoryKPIs, StockStatus, InventoryModalMode } from '@/types/inventory.types';
import { StockStatusBadge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import InventoryModal from '@/components/modals/InventoryModal';

// ─── KPI Cards ────────────────────────────────────────────
const KPICards = ({ kpis }: { kpis: InventoryKPIs }) => {
  const cards = [
    { label: 'Tổng sản phẩm', value: kpis.totalProducts, color: 'bg-blue-50 text-blue-600', emoji: '📦' },
    { label: 'Còn hàng', value: kpis.inStock, color: 'bg-green-50 text-green-600', emoji: '✅' },
    { label: 'Sắp hết', value: kpis.lowStock, color: 'bg-amber-50 text-amber-600', emoji: '⚠️' },
    { label: 'Hết hàng', value: kpis.outOfStock, color: 'bg-red-50 text-red-600', emoji: '❌' },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-2xl border border-border p-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${c.color} mb-3`}>
            {c.emoji}
          </div>
          <p className="font-bold text-2xl text-navy">{c.value}</p>
          <p className="text-sm text-mid-gray mt-0.5">{c.label}</p>
        </div>
      ))}
    </div>
  );
};

// ─── Inventory page ───────────────────────────────────────
export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [kpis, setKpis] = useState<InventoryKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StockStatus | 'ALL'>('ALL');
  const [modal, setModal] = useState<{ mode: InventoryModalMode; item?: InventoryItem } | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [data, kpiData] = await Promise.all([
      inventoryService.getAll({ name: search || undefined, status: statusFilter === 'ALL' ? undefined : statusFilter }),
      inventoryService.getKPIs(),
    ]);
    setItems(data.result);
    setKpis(kpiData);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [search, statusFilter]);

  const STATUS_FILTERS: { value: StockStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'IN_STOCK', label: 'Còn hàng' },
    { value: 'LOW_STOCK', label: 'Sắp hết' },
    { value: 'OUT_OF_STOCK', label: 'Hết hàng' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-head font-bold text-2xl text-navy">Quản lý kho hàng</h1>
          <p className="text-mid-gray text-sm mt-1">Theo dõi tồn kho và nhập hàng</p>
        </div>
        <button
          onClick={() => setModal({ mode: 'add' })}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" /> Thêm sản phẩm
        </button>
      </div>

      {/* KPI Cards */}
      {kpis && <KPICards kpis={kpis} />}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-border p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-gray" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm sản phẩm, SKU..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === f.value ? 'bg-primary text-white' : 'bg-gray-100 text-mid-gray hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                {['Sản phẩm', 'SKU', 'Danh mục', 'Giá', 'Tồn kho', 'Trạng thái', 'Thao tác'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-mid-gray uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-mid-gray">Không tìm thấy sản phẩm</td>
                </tr>
              ) : items.map((item) => (
                <tr key={item.pid} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-navy text-sm">{item.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-mid-gray">{item.sku}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-mid-gray">{item.category}</td>
                  <td className="px-4 py-3 font-semibold text-navy text-sm">{formatPrice(item.price)}</td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-bold text-navy">{item.stock}</span>
                      {item.stock <= item.threshold && item.stock > 0 && (
                        <span className="ml-2 text-xs text-amber-500">⚠ thấp</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StockStatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setModal({ mode: 'restock', item })}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <PackagePlus className="w-3 h-3" /> Nhập kho
                      </button>
                      <button
                        onClick={() => setModal({ mode: 'edit', item })}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Edit className="w-3 h-3" /> Sửa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <InventoryModal
          mode={modal.mode}
          item={modal.item}
          onClose={() => setModal(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
