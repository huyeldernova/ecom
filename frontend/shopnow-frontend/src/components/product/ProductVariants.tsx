'use client';

import { ProductVariant } from '@/types/product.types';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ProductVariantsProps {
  variants: ProductVariant[];
  selected: ProductVariant;
  onChange: (variant: ProductVariant) => void;
}

const ProductVariants = ({ variants, selected, onChange }: ProductVariantsProps) => {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-navy">
        Phiên bản:{' '}
        <span className="font-normal text-mid-gray">{selected.variantName}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const isSelected = v.id === selected.id;
          const isDisabled = !v.isActive;
          const price = v.effectivePrice;

          return (
            <button
              key={v.id}
              onClick={() => !isDisabled && onChange(v)}
              disabled={isDisabled}
              className={cn(
                'px-4 py-2 rounded-xl border text-sm font-medium transition-all',
                isSelected
                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                  : 'border-border text-mid-gray hover:border-primary/50 hover:text-navy',
                isDisabled && 'opacity-40 cursor-not-allowed line-through'
              )}
            >
              <span>{v.variantName}</span>
              {v.finalPrice && (
                <span className="ml-2 text-xs text-primary font-semibold">
                  {formatPrice(price)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductVariants;
