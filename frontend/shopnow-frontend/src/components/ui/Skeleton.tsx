import { cn } from '@/lib/utils';

// ─── Base Skeleton ────────────────────────────────────────
interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => (
  <div
    className={cn(
      'animate-pulse rounded-md bg-gray-200',
      className
    )}
  />
);

// ─── Product Card Skeleton ────────────────────────────────
export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-border overflow-hidden">
    <Skeleton className="w-full aspect-square" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex justify-between items-center pt-1">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  </div>
);

// ─── Product Grid Skeleton ────────────────────────────────
export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

// ─── Cart Item Skeleton ───────────────────────────────────
export const CartItemSkeleton = () => (
  <div className="flex gap-3 p-3">
    <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  </div>
);

// ─── Order Card Skeleton ──────────────────────────────────
export const OrderCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-border p-4 space-y-3">
    <div className="flex justify-between">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>
    <Skeleton className="h-3 w-1/3" />
    <div className="flex gap-2">
      <Skeleton className="w-12 h-12 rounded-lg" />
      <Skeleton className="w-12 h-12 rounded-lg" />
    </div>
    <div className="flex justify-between items-center">
      <Skeleton className="h-5 w-1/4" />
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
  </div>
);

// ─── Table Row Skeleton ───────────────────────────────────
export const TableRowSkeleton = ({ cols = 5 }: { cols?: number }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

export default Skeleton;
