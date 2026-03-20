import { cn } from '@/lib/utils';
import Button from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center py-16 px-4 text-center',
      className
    )}
  >
    {icon && (
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-light-gray">
        {icon}
      </div>
    )}
    <h3 className="font-head font-semibold text-navy text-lg mb-1">{title}</h3>
    {description && (
      <p className="text-mid-gray text-sm max-w-xs mb-6">{description}</p>
    )}
    {actionLabel && onAction && (
      <Button onClick={onAction} size="md">
        {actionLabel}
      </Button>
    )}
  </div>
);

export default EmptyState;
