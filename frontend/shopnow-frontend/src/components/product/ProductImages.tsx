'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductImagesProps {
  images: string[];
  productName: string;
}

const ProductImages = ({ images, productName }: ProductImagesProps) => {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const prev = () => setActive((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActive((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative bg-background rounded-2xl overflow-hidden aspect-square group">
        <img
          src={images[active]}
          alt={`${productName} - ${active + 1}`}
          className="w-full h-full object-cover"
        />
        {/* Zoom hint */}
        <button
          onClick={() => setZoomed(true)}
          className="absolute top-3 right-3 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-lg
                     flex items-center justify-center opacity-0 group-hover:opacity-100
                     transition-opacity shadow-sm text-mid-gray hover:text-navy"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        {/* Prev / Next */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm
                         rounded-full shadow-md flex items-center justify-center text-mid-gray hover:text-navy
                         opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm
                         rounded-full shadow-md flex items-center justify-center text-mid-gray hover:text-navy
                         opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  i === active ? 'bg-primary w-5' : 'bg-white/60'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                'w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all',
                i === active ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
              )}
            >
              <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Zoom modal */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}
        >
          <img
            src={images[active]}
            alt={productName}
            className="max-w-full max-h-full object-contain rounded-xl"
          />
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white text-sm"
            onClick={() => setZoomed(false)}
          >
            ✕ Đóng
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductImages;
