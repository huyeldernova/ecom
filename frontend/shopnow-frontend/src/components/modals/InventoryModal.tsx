'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, PackagePlus, Edit, Plus, Loader2 } from 'lucide-react';
import { InventoryItem, InventoryModalMode } from '@/types/inventory.types';
import { inventoryService } from '@/services/inventoryService';
import { toast } from '@/components/ui/Toast';

// ─── Schemas per mode ─────────────────────────────────────
const restockSchema = z.object({
  quantity: z.coerce.number().min(1, 'Tối thiểu 1'),
  reason: z.string().min(1, 'Vui lòng chọn lý do'),
});

const editSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên'),
  price: z.coerce.number().min(0, 'Giá không hợp lệ'),
  threshold: z.coerce.number().min(1, 'Tối thiểu 1'),
});

const addSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên'),
  sku: z.string().min(1, 'Vui lòng nhập SKU'),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().min(0),
  threshold: z.coerce.number().min(1),
  category: z.string().min(1, 'Vui lòng chọn danh mục'),
});

type RestockForm = z.infer<typeof restockSchema>;
type EditForm = z.infer<typeof editSchema>;
type AddForm = z.infer<typeof addSchema>;

interface InventoryModalProps {
  mode: InventoryModalMode;
  item?: InventoryItem;
  onClose: () => void;
  onSuccess?: () => void;
}

const RESTOCK_REASONS = ['Nhập hàng định kỳ', 'Hàng trả về', 'Bổ sung khẩn cấp', 'Kiểm kho điều chỉnh'];
const CATEGORIES = ['Electronics', 'Fashion', 'Sports', 'Home', 'Beauty', 'Books'];

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-border text-sm text-navy bg-white placeholder:text-light-gray focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors';

const modeConfig = {
  restock: { icon: <PackagePlus className="w-5 h-5" />, title: 'Nhập kho', color: 'text-green-600 bg-green-50' },
  edit: { icon: <Edit className="w-5 h-5" />, title: 'Chỉnh sửa sản phẩm', color: 'text-blue-600 bg-blue-50' },
  add: { icon: <Plus className="w-5 h-5" />, title: 'Thêm sản phẩm mới', color: 'text-primary bg-primary/10' },
};

const InventoryModal = ({ mode, item, onClose, onSuccess }: InventoryModalProps) => {
  const config = modeConfig[mode];

  const restockForm = useForm<RestockForm>({ resolver: zodResolver(restockSchema) });
  const editForm = useForm<EditForm>({ resolver: zodResolver(editSchema), defaultValues: { name: item?.name, price: item?.price, threshold: item?.threshold } });
  const addForm = useForm<AddForm>({ resolver: zodResolver(addSchema) });

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const handleRestock = async (data: RestockForm) => {
    await inventoryService.restock(item!.pid, data);
    toast.success(`Đã nhập ${data.quantity} sản phẩm vào kho`);
    onSuccess?.();
    onClose();
  };

  const handleEdit = async (data: EditForm) => {
    await inventoryService.updateProduct(item!.pid, data);
    toast.success('Đã cập nhật thông tin sản phẩm');
    onSuccess?.();
    onClose();
  };

  const handleAdd = async (data: AddForm) => {
    await new Promise((r) => setTimeout(r, 600));
    toast.success(`Đã thêm sản phẩm "${data.name}" vào kho`);
    onSuccess?.();
    onClose();
  };

  const renderForm = () => {
    if (mode === 'restock') {
      return (
        <form onSubmit={restockForm.handleSubmit(handleRestock)} className="space-y-4">
          {item && (
            <div className="bg-gray-50 rounded-xl p-3 text-sm">
              <p className="font-semibold text-navy">{item.name}</p>
              <p className="text-mid-gray">SKU: {item.sku} · Tồn kho: <span className="font-medium">{item.stock}</span></p>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-navy">Số lượng nhập *</label>
            <input type="number" min={1} placeholder="0" {...restockForm.register('quantity')} className={inputCls} />
            {restockForm.formState.errors.quantity && <p className="text-xs text-red-500">{restockForm.formState.errors.quantity.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-navy">Lý do nhập kho *</label>
            <select {...restockForm.register('reason')} className={inputCls}>
              <option value="">Chọn lý do...</option>
              {RESTOCK_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            {restockForm.formState.errors.reason && <p className="text-xs text-red-500">{restockForm.formState.errors.reason.message}</p>}
          </div>
          <button type="submit" disabled={restockForm.formState.isSubmitting}
            className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {restockForm.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Xác nhận nhập kho
          </button>
        </form>
      );
    }

    if (mode === 'edit') {
      return (
        <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
          {[
            { name: 'name' as const, label: 'Tên sản phẩm', type: 'text' },
            { name: 'price' as const, label: 'Giá (USD)', type: 'number' },
            { name: 'threshold' as const, label: 'Ngưỡng cảnh báo tồn kho', type: 'number' },
          ].map((f) => (
            <div key={f.name} className="space-y-1.5">
              <label className="block text-sm font-medium text-navy">{f.label}</label>
              <input type={f.type} {...editForm.register(f.name)} className={inputCls} />
              {editForm.formState.errors[f.name] && <p className="text-xs text-red-500">{editForm.formState.errors[f.name]?.message}</p>}
            </div>
          ))}
          <button type="submit" disabled={editForm.formState.isSubmitting}
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {editForm.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Lưu thay đổi
          </button>
        </form>
      );
    }

    // add mode
    return (
      <form onSubmit={addForm.handleSubmit(handleAdd)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'name' as const, label: 'Tên sản phẩm', colSpan: true, type: 'text' },
            { name: 'sku' as const, label: 'SKU', colSpan: false, type: 'text' },
            { name: 'category' as const, label: 'Danh mục', colSpan: false, type: 'select' },
            { name: 'price' as const, label: 'Giá (USD)', colSpan: false, type: 'number' },
            { name: 'stock' as const, label: 'Số lượng ban đầu', colSpan: false, type: 'number' },
            { name: 'threshold' as const, label: 'Ngưỡng cảnh báo', colSpan: false, type: 'number' },
          ].map((f) => (
            <div key={f.name} className={`space-y-1.5 ${f.colSpan ? 'col-span-2' : ''}`}>
              <label className="block text-sm font-medium text-navy">{f.label}</label>
              {f.type === 'select' ? (
                <select {...addForm.register(f.name)} className={inputCls}>
                  <option value="">Chọn...</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <input type={f.type} {...addForm.register(f.name)} className={inputCls} />
              )}
              {addForm.formState.errors[f.name] && <p className="text-xs text-red-500">{addForm.formState.errors[f.name]?.message}</p>}
            </div>
          ))}
        </div>
        <button type="submit" disabled={addForm.formState.isSubmitting}
          className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {addForm.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Thêm sản phẩm
        </button>
      </form>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${config.color}`}>
              {config.icon}
            </div>
            <h2 className="font-head font-bold text-navy">{config.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-light-gray hover:text-navy hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {renderForm()}
      </div>
    </div>
  );
};

export default InventoryModal;
