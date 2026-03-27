'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, Trash2, Plus, UploadCloud, X, ImageIcon } from 'lucide-react';
import {
  productAdminService,
  CategoryPayload,
  ProductPayload,
  VariantPayload,
} from '@/services/productAdminService';
import { toast } from '@/components/ui/Toast';

// ─── Types ────────────────────────────────────────────────
interface Category {
  id: string;
  name: string;
  parentId: string | null;
  description?: string;
  displayOrder?: number;
  children?: Category[];
}

// ─── Helpers ──────────────────────────────────────────────
function flattenTree(tree: Category[]): Category[] {
  const result: Category[] = [];
  const walk = (items: Category[], parentId: string | null) => {
    items.forEach(item => {
      result.push({ ...item, parentId: parentId ?? item.parentId });
      if (item.children?.length) walk(item.children, item.id);
    });
  };
  walk(tree, null);
  return result;
}

// ─── Step indicator ───────────────────────────────────────
const steps = ['Ngành hàng', 'Thông tin', 'Phân loại', 'Xác nhận'];

const StepBar = ({ current, data }: { current: number; data: any }) => (
  <div className="flex bg-white rounded-2xl border border-border overflow-hidden mb-6">
    {steps.map((label, i) => {
      const idx = i + 1;
      const isActive = idx === current;
      const isDone = idx < current;
      return (
        <div
          key={idx}
          className={`flex-1 flex items-center gap-3 px-4 py-3.5 border-r border-border last:border-r-0 transition-colors ${
            isActive ? 'bg-primary/5' : isDone ? 'bg-gray-50' : ''
          }`}
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            isActive ? 'bg-primary text-white' :
            isDone   ? 'bg-green-500 text-white' :
                       'bg-gray-100 text-mid-gray'
          }`}>
            {isDone ? '✓' : idx}
          </div>
          <div className="min-w-0">
            <p className={`text-xs font-semibold ${isActive ? 'text-primary' : isDone ? 'text-navy' : 'text-mid-gray'}`}>
              {label}
            </p>
            <p className="text-[10px] text-light-gray truncate">
              {idx === 1 && data.catLabel ? data.catLabel :
               idx === 2 && data.name     ? data.name :
               idx === 3                  ? `${data.variantCount} phiên bản` : ''}
            </p>
          </div>
        </div>
      );
    })}
  </div>
);

// ─── Step 1: Category Browser ─────────────────────────────
const CategoryBrowser = ({
  cats,
  selRoot, selSub,
  onPickRoot, onPickSub,
  onCreateCat,
}: {
  cats: Category[];
  selRoot: string | null;
  selSub: string | null;
  onPickRoot: (id: string) => void;
  onPickSub: (id: string | null) => void;
  onCreateCat: (parentId: string | null) => void;
}) => {
  const roots  = cats.filter(c => !c.parentId);
  const subs   = selRoot ? cats.filter(c => c.parentId === selRoot) : [];
  const rootCat = cats.find(c => c.id === selRoot);

  return (
    <div>
      <p className="text-sm text-mid-gray mb-3">
        Chọn ngành hàng phù hợp. Nếu chưa có, tạo mới bên dưới.
      </p>
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-2 min-h-[240px]">
          {/* Cột 1: Root */}
          <div className="border-r border-border">
            <div className="bg-gray-50 border-b border-border px-3 py-2">
              <span className="text-[11px] font-semibold text-light-gray uppercase tracking-wide">
                Ngành hàng gốc
              </span>
            </div>
            <div className="overflow-y-auto max-h-[240px]">
              {roots.map(c => (
                <button
                  key={c.id}
                  onClick={() => onPickRoot(c.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm text-left transition-colors ${
                    selRoot === c.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-navy hover:bg-gray-50'
                  }`}
                >
                  <span>{c.name}</span>
                  {cats.some(x => x.parentId === c.id) && (
                    <span className="text-light-gray text-xs">›</span>
                  )}
                </button>
              ))}
            </div>
            <div className="border-t border-border p-2">
              <button
                onClick={() => onCreateCat(null)}
                className="w-full text-left text-xs text-primary px-2 py-1.5 rounded-lg border border-dashed border-primary/30 hover:bg-primary/5 transition-colors"
              >
                + Tạo ngành hàng gốc mới
              </button>
            </div>
          </div>

          {/* Cột 2: Sub */}
          <div>
            <div className="bg-gray-50 border-b border-border px-3 py-2">
              <span className="text-[11px] font-semibold text-light-gray uppercase tracking-wide">
                Ngành hàng con
              </span>
            </div>
            <div className="overflow-y-auto max-h-[240px]">
              {!selRoot ? (
                <p className="text-xs text-light-gray text-center py-8">
                  Chọn ngành hàng gốc trước
                </p>
              ) : (
                <>
                  <button
                    onClick={() => onPickSub(null)}
                    className={`w-full flex items-center px-3 py-2.5 text-sm text-left transition-colors ${
                      selSub === null
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-mid-gray hover:bg-gray-50'
                    }`}
                  >
                    Dùng &quot;{rootCat?.name}&quot; trực tiếp
                  </button>
                  {subs.map(c => (
                    <button
                      key={c.id}
                      onClick={() => onPickSub(c.id)}
                      className={`w-full flex items-center px-3 py-2.5 text-sm text-left transition-colors ${
                        selSub === c.id
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-navy hover:bg-gray-50'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </>
              )}
            </div>
            {selRoot && (
              <div className="border-t border-border p-2">
                <button
                  onClick={() => onCreateCat(selRoot)}
                  className="w-full text-left text-xs text-primary px-2 py-1.5 rounded-lg border border-dashed border-primary/30 hover:bg-primary/5 transition-colors"
                >
                  + Tạo ngành hàng con
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {selRoot && (
        <div className="mt-3 flex items-center justify-between bg-primary/5 rounded-xl px-4 py-2.5">
          <span className="text-sm font-medium text-primary">
            Đã chọn: {[
              cats.find(c => c.id === selRoot)?.name,
              selSub ? cats.find(c => c.id === selSub)?.name : null,
            ].filter(Boolean).join(' > ')}
          </span>
        </div>
      )}
    </div>
  );
};

// ─── Create Category Modal ────────────────────────────────
const CreateCatModal = ({
  open, parentId, roots, onClose, onCreated,
}: {
  open: boolean;
  parentId: string | null;
  roots: Category[];
  onClose: () => void;
  onCreated: (cat: Category) => void;
}) => {
  const [form, setForm] = useState<CategoryPayload>({
    name: '', description: '', displayOrder: 0, parentId: parentId ?? undefined,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm({ name: '', description: '', displayOrder: 0, parentId: parentId ?? undefined });
  }, [open, parentId]);

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const created = await productAdminService.createCategory(form);
      toast.success(`Đã tạo ngành hàng "${form.name}"`);
      onCreated({ ...created, parentId: form.parentId ?? null });
      onClose();
    } catch {
      toast.error('Tạo ngành hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 z-10">
        <h2 className="font-semibold text-navy mb-4">
          {parentId ? 'Tạo ngành hàng con' : 'Tạo ngành hàng gốc'}
        </h2>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-mid-gray mb-1">Tên ngành hàng *</label>
            <input
              autoFocus
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="VD: Sneakers, Laptops..."
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-mid-gray mb-1">
              Thuộc ngành hàng <span className="text-light-gray font-normal">(tùy chọn)</span>
            </label>
            <select
              value={form.parentId ?? ''}
              onChange={e => setForm(f => ({ ...f, parentId: e.target.value || undefined }))}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Không có (ngành hàng gốc)</option>
              {roots.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-mid-gray mb-1">
              Mô tả <span className="text-light-gray font-normal">(tùy chọn)</span>
            </label>
            <input
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Mô tả ngắn..."
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-mid-gray mb-1">
              Thứ tự hiển thị <span className="text-light-gray font-normal">(tùy chọn)</span>
            </label>
            <input
              type="number"
              min={0}
              value={form.displayOrder}
              onChange={e => setForm(f => ({ ...f, displayOrder: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-gray-50">
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !form.name.trim()}
            className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-60 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Tạo ngành hàng
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Step 2: Product Info (có upload ảnh thật lên S3) ─────
const inputCls = 'w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors';

const ProductInfoForm = ({ form, setForm }: { form: ProductPayload; setForm: any }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Upload 1 file lên S3 thông qua backend ──────────────
  const handleUpload = async (file: File) => {
    // Validate phía client trước khi gửi
    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận file ảnh (jpg, png, webp...)');
      return;
    }
    if (file.size > 314_572_800) { // 300 MB — khớp với backend max-size
      toast.error('File quá lớn. Tối đa 300 MB');
      return;
    }

    setUploading(true);
    try {
      // Gọi POST /product/api/v1/files  →  multipart/form-data  key = "files"
      const result = await productAdminService.uploadFiles([file]);
      const s3Url  = result[0].url; // URL thật trên S3
      setForm((f: any) => ({ ...f, thumbnailUrl: s3Url }));
      toast.success('Upload ảnh thành công!');
    } catch {
      toast.error('Upload ảnh thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    // Reset input để có thể chọn lại cùng file
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const clearThumbnail = () => setForm((f: any) => ({ ...f, thumbnailUrl: '' }));

  return (
    <div className="space-y-4">
      {/* Tên sản phẩm */}
      <div>
        <label className="block text-sm font-medium text-navy mb-1.5">Tên sản phẩm *</label>
        <input
          value={form.name}
          onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))}
          placeholder="VD: Nike Air Force 1 Low White"
          className={inputCls}
        />
      </div>

      {/* Brand + Giá */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Brand *</label>
          <input
            value={form.brand}
            onChange={e => setForm((f: any) => ({ ...f, brand: e.target.value }))}
            placeholder="VD: Nike"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Giá gốc (USD) *</label>
          <input
            type="number"
            min={0}
            value={form.price || ''}
            onChange={e => setForm((f: any) => ({ ...f, price: Number(e.target.value) }))}
            placeholder="0"
            className={inputCls}
          />
        </div>
      </div>

      {/* ── Thumbnail Upload ── ĐÃ FIX: upload file thật lên S3 thay vì paste URL */}
      <div>
        <label className="block text-sm font-medium text-navy mb-1.5">
          Ảnh thumbnail <span className="font-normal text-light-gray text-xs">— tùy chọn</span>
        </label>

        {/* Trường hợp đã có URL (đã upload xong) */}
        {form.thumbnailUrl ? (
          <div className="relative inline-block">
            <img
              src={form.thumbnailUrl}
              alt="Thumbnail preview"
              className="h-32 w-32 object-cover rounded-xl border border-border"
            />
            {/* Nút xóa để upload lại */}
            <button
              onClick={clearThumbnail}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
              title="Xóa ảnh, upload lại"
            >
              <X className="w-3 h-3" />
            </button>
            <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
              ✓ Đã upload lên S3
            </p>
          </div>
        ) : (
          /* Drag & Drop / Click to upload zone */
          <div
            onClick={() => !uploading && inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`
              flex flex-col items-center justify-center gap-2
              w-full h-36 border-2 border-dashed rounded-xl cursor-pointer
              transition-colors
              ${uploading
                ? 'border-primary/40 bg-primary/5 cursor-not-allowed'
                : dragOver
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50 hover:bg-gray-50'
              }
            `}
          >
            {uploading ? (
              <>
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <span className="text-sm text-primary font-medium">Đang upload lên S3...</span>
              </>
            ) : (
              <>
                {dragOver
                  ? <UploadCloud className="w-7 h-7 text-primary" />
                  : <ImageIcon className="w-7 h-7 text-light-gray" />
                }
                <div className="text-center">
                  <span className="text-sm text-mid-gray">
                    Kéo thả ảnh vào đây, hoặc{' '}
                    <span className="text-primary font-medium underline underline-offset-2">
                      chọn file
                    </span>
                  </span>
                  <p className="text-xs text-light-gray mt-0.5">JPG, PNG, WEBP — tối đa 300 MB</p>
                </div>
              </>
            )}

            {/* Input file ẩn — trigger bằng click vào zone hoặc ref */}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
              disabled={uploading}
            />
          </div>
        )}
      </div>

      {/* Mô tả */}
      <div>
        <label className="block text-sm font-medium text-navy mb-1.5">
          Mô tả <span className="font-normal text-light-gray text-xs">— tùy chọn</span>
        </label>
        <textarea
          value={form.description}
          onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))}
          placeholder="Mô tả ngắn về sản phẩm..."
          rows={3}
          className={inputCls + ' resize-none'}
        />
      </div>
    </div>
  );
};

// ─── Step 3: Variants ─────────────────────────────────────
const VariantsForm = ({
  variants,
  setVariants,
}: {
  variants: VariantPayload[];
  setVariants: (v: VariantPayload[]) => void;
}) => {
  const add    = () => setVariants([...variants, { sku: '', size: '', color: '', finalPrice: 0 }]);
  const remove = (i: number) => setVariants(variants.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof VariantPayload, val: any) =>
    setVariants(variants.map((v, idx) => idx === i ? { ...v, [field]: val } : v));

  return (
    <div>
      <p className="text-sm text-mid-gray mb-4">
        Mỗi phiên bản là 1 tổ hợp size + màu sắc. Cần ít nhất 1 phiên bản.
      </p>

      {variants.length > 0 && (
        <div className="grid grid-cols-[1fr_1fr_1fr_90px_32px] gap-2 px-2 mb-1">
          {['Size', 'Màu sắc', 'SKU', 'Giá (USD)', ''].map(h => (
            <span key={h} className="text-[11px] font-medium text-light-gray">{h}</span>
          ))}
        </div>
      )}

      <div className="space-y-2 mb-3">
        {variants.map((v, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_1fr_90px_32px] gap-2 items-center bg-gray-50 rounded-xl px-2 py-2">
            {[
              { field: 'size'  as const, placeholder: 'M, XL, 42...' },
              { field: 'color' as const, placeholder: 'Đen, Trắng...' },
              { field: 'sku'   as const, placeholder: 'Tự tạo' },
            ].map(({ field, placeholder }) => (
              <input
                key={field}
                value={(v[field] as string) ?? ''}
                onChange={e => update(i, field, e.target.value)}
                placeholder={placeholder}
                className="w-full px-2 py-1.5 border border-border rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
              />
            ))}
            <input
              type="number"
              min={0}
              value={v.finalPrice || ''}
              onChange={e => update(i, 'finalPrice', Number(e.target.value))}
              placeholder="0"
              className="w-full px-2 py-1.5 border border-border rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
            />
            <button
              onClick={() => remove(i)}
              className="flex items-center justify-center text-light-gray hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={add}
        className="w-full py-2.5 border border-dashed border-border rounded-xl text-sm text-mid-gray hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-1.5"
      >
        <Plus className="w-4 h-4" /> Thêm phiên bản
      </button>
    </div>
  );
};

// ─── Step 4: Review ───────────────────────────────────────
const ReviewPanel = ({
  catLabel, product, variants,
}: {
  catLabel: string;
  product: ProductPayload;
  variants: VariantPayload[];
}) => (
  <div className="space-y-4">
    <p className="text-sm text-mid-gray">Kiểm tra lại thông tin. Bấm vào bước trên để quay lại chỉnh sửa.</p>

    {[
      { title: 'Ngành hàng', rows: [['Category', catLabel]] },
      {
        title: 'Thông tin sản phẩm',
        rows: [
          ['Tên sản phẩm', product.name],
          ['Brand', product.brand],
          ['Giá gốc', `$${product.price}`],
          ...(product.description
            ? [['Mô tả', product.description.slice(0, 60) + (product.description.length > 60 ? '...' : '')]]
            : []),
        ],
      },
    ].map(({ title, rows }) => (
      <div key={title} className="bg-gray-50 rounded-xl p-4">
        <p className="text-[11px] font-semibold text-light-gray uppercase tracking-wide mb-3">{title}</p>
        <div className="space-y-0">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between py-1.5 border-b border-border last:border-b-0 text-sm">
              <span className="text-mid-gray">{k}</span>
              <span className="font-medium text-navy text-right max-w-[55%]">{v}</span>
            </div>
          ))}
        </div>
      </div>
    ))}

    {/* Preview thumbnail nếu đã upload */}
    {product.thumbnailUrl && (
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-[11px] font-semibold text-light-gray uppercase tracking-wide mb-3">Ảnh thumbnail</p>
        <img
          src={product.thumbnailUrl}
          alt="Thumbnail"
          className="h-24 w-24 object-cover rounded-xl border border-border"
        />
      </div>
    )}

    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-[11px] font-semibold text-light-gray uppercase tracking-wide mb-3">
        Phân loại ({variants.length} phiên bản)
      </p>
      {variants.length === 0 ? (
        <p className="text-sm text-light-gray">Chưa có phiên bản nào</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {variants.map((v, i) => (
            <span key={i} className="px-3 py-1 bg-white border border-border rounded-full text-xs text-mid-gray">
              {[v.size, v.color].filter(Boolean).join(' / ') || 'Phiên bản'} — ${v.finalPrice}
            </span>
          ))}
        </div>
      )}
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────
export default function AdminProductsPage() {
  const [step, setStep]     = useState(1);
  const [cats, setCats]     = useState<Category[]>([]);
  const [selRoot, setSelRoot] = useState<string | null>(null);
  const [selSub, setSelSub]   = useState<string | null>(null);
  const [modalOpen, setModalOpen]       = useState(false);
  const [modalParentId, setModalParentId] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductPayload>({
    name: '', brand: '', price: 0, categoryId: '',
    description: '', thumbnailUrl: '', variants: [],
  });
  const [variants, setVariants] = useState<VariantPayload[]>([]);
  const [saving, setSaving]     = useState(false);

  const loadCats = useCallback(async () => {
    try {
      const tree = await productAdminService.getCategories();
      setCats(flattenTree(tree ?? []));
    } catch {
      setCats([]);
    }
  }, []);

  useEffect(() => { loadCats(); }, [loadCats]);

  const catLabel = (() => {
    const root = cats.find(c => c.id === selRoot);
    const sub  = selSub ? cats.find(c => c.id === selSub) : null;
    return root ? [root.name, sub?.name].filter(Boolean).join(' > ') : '';
  })();

  const categoryId = selSub ?? selRoot ?? '';

  const validate = () => {
    if (step === 1 && !selRoot)         { toast.error('Vui lòng chọn ngành hàng');    return false; }
    if (step === 2) {
      if (!product.name.trim())         { toast.error('Vui lòng nhập tên sản phẩm'); return false; }
      if (!product.brand.trim())        { toast.error('Vui lòng nhập brand');         return false; }
      if (!product.price)               { toast.error('Vui lòng nhập giá');           return false; }
    }
    if (step === 3 && variants.length === 0) { toast.error('Thêm ít nhất 1 phiên bản'); return false; }
    return true;
  };

  const next = async () => {
    if (!validate()) return;
    if (step < 4) { setStep(s => s + 1); return; }

    // ── Bước 4: Lưu sản phẩm ────────────────────────────
    // thumbnailUrl lúc này đã là URL S3 thật (hoặc rỗng nếu không upload)
    setSaving(true);
    try {
      await productAdminService.createProduct({
        ...product,
        categoryId,
        variants,
      });
      toast.success(`Tạo sản phẩm "${product.name}" thành công`);
      // Reset toàn bộ form
      setStep(1);
      setSelRoot(null); setSelSub(null);
      setProduct({ name: '', brand: '', price: 0, categoryId: '', description: '', thumbnailUrl: '', variants: [] });
      setVariants([]);
    } catch {
      toast.error('Tạo sản phẩm thất bại');
    } finally {
      setSaving(false);
    }
  };

  const openCreateCat = (parentId: string | null) => {
    setModalParentId(parentId);
    setModalOpen(true);
  };

  const handleCatCreated = (cat: Category) => {
    setCats(prev => [...prev, cat]);
    if (cat.parentId) { setSelRoot(cat.parentId); setSelSub(cat.id); }
    else              { setSelRoot(cat.id);        setSelSub(null);   }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-head font-bold text-2xl text-navy">Thêm sản phẩm mới</h1>
        <p className="text-mid-gray text-sm mt-1">Hoàn thành 4 bước để tạo sản phẩm</p>
      </div>

      <StepBar
        current={step}
        data={{ catLabel, name: product.name, variantCount: variants.length }}
      />

      <div className="bg-white rounded-2xl border border-border p-6">
        {step === 1 && (
          <CategoryBrowser
            cats={cats}
            selRoot={selRoot}
            selSub={selSub}
            onPickRoot={id => { setSelRoot(id); setSelSub(null); }}
            onPickSub={setSelSub}
            onCreateCat={openCreateCat}
          />
        )}
        {step === 2 && <ProductInfoForm form={product} setForm={setProduct} />}
        {step === 3 && <VariantsForm variants={variants} setVariants={setVariants} />}
        {step === 4 && <ReviewPanel catLabel={catLabel} product={product} variants={variants} />}

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <button
            onClick={() => setStep(s => s - 1)}
            style={{ visibility: step > 1 ? 'visible' : 'hidden' }}
            className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            ← Quay lại
          </button>
          <button
            onClick={next}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {step === 4 ? 'Lưu sản phẩm' : 'Tiếp theo →'}
          </button>
        </div>
      </div>

      <CreateCatModal
        open={modalOpen}
        parentId={modalParentId}
        roots={cats.filter(c => !c.parentId)}
        onClose={() => setModalOpen(false)}
        onCreated={handleCatCreated}
      />
    </div>
  );
}