import { cn } from '@/lib/utils';
import { OrderStatus } from '@/types/order.types';
import { StockStatus } from '@/types/inventory.types';

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:  'bg-gray-100 text-mid-gray',
  primary:  'bg-primary/10 text-primary',
  success:  'bg-green-50 text-green-700',
  warning:  'bg-amber-50 text-amber-700',
  danger:   'bg-red-50 text-red-600',
  info:     'bg-blue-50 text-blue-700',
  outline:  'border border-border text-mid-gray bg-white',
};

const Badge = ({ children, variant = 'default', className }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variantStyles[variant],
      className
    )}
  >
    {children}
  </span>
);

// ─── Order Status Badge ───────────────────────────────────
const orderStatusMap: Record<OrderStatus, { label: string; variant: BadgeVariant }> = {
  PENDING:   { label: 'Chờ xử lý',  variant: 'warning' },
  CONFIRMED: { label: 'Đã xác nhận', variant: 'info' },
  SHIPPING:  { label: 'Đang giao',   variant: 'primary' },
  DELIVERED: { label: 'Đã giao',     variant: 'success' },
  CANCELLED: { label: 'Đã hủy',      variant: 'danger' },
};

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  const { label, variant } = orderStatusMap[status];
  return <Badge variant={variant}>{label}</Badge>;
};

// ─── Stock Status Badge ───────────────────────────────────
const stockStatusMap: Record<StockStatus, { label: string; variant: BadgeVariant }> = {
  IN_STOCK:    { label: 'Còn hàng',  variant: 'success' },
  LOW_STOCK:   { label: 'Sắp hết',   variant: 'warning' },
  OUT_OF_STOCK: { label: 'Hết hàng', variant: 'danger' },
};

export const StockStatusBadge = ({ status }: { status: StockStatus }) => {
  const { label, variant } = stockStatusMap[status];
  return <Badge variant={variant}>{label}</Badge>;
};

export default Badge;
