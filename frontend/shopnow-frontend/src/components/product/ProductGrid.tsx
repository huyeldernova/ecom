import { Product } from '@/types/product.types';
import ProductCard from './ProductCard';
import EmptyState from '@/components/ui/EmptyState';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { PackageSearch } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

const ProductGrid = ({ products, loading = false }: ProductGridProps) => {
  if (loading) return <ProductGridSkeleton count={8} />;

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<PackageSearch className="w-8 h-8" />}
        title="Không tìm thấy sản phẩm"
        description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
        actionLabel="Xóa bộ lọc"
        onAction={() => window.location.href = '/products'}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
