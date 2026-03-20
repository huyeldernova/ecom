import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Display only ────────────────────────────────────────
interface StarRatingDisplayProps {
  rating: number;        // 0-5
  count?: number;        // review count
  size?: 'sm' | 'md';
}

export const StarRatingDisplay = ({
  rating,
  count,
  size = 'sm',
}: StarRatingDisplayProps) => {
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              starSize,
              i <= Math.round(rating)
                ? 'fill-accent text-accent'
                : 'fill-gray-200 text-gray-200'
            )}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-light-gray ml-1">({count})</span>
      )}
    </div>
  );
};

// ─── Interactive input ────────────────────────────────────
interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
}

export const StarRatingInput = ({ value, onChange }: StarRatingInputProps) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
        >
          <Star
            className={cn(
              'w-7 h-7 transition-colors',
              i <= (hovered || value)
                ? 'fill-accent text-accent'
                : 'fill-gray-200 text-gray-200'
            )}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRatingDisplay;
