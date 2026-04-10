import type { ProductDetailVariant } from '../product/product-detail.types';

export interface LikedProductItem {
  likedAt: Date;
  product: {
    id: string;
    title: string;
    slug: string;
    description: string;
    categoryId: string;
    tags: string[];
    isFeatured: boolean;
    status: string;
    publishedAt: Date | null;
    variants: ProductDetailVariant[];
  };
}

export interface LikedProductsResult {
  items: LikedProductItem[];
  total: number;
}
