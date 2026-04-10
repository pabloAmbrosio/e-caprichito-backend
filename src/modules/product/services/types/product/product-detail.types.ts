import type { Prisma } from '../../../../../lib/prisma';
import type { ProductImage } from '../../../types';
import type { ProductDisplayPromotion } from '../../../adapters';

type JsonValue = Prisma.JsonValue;

export interface CategoryBreadcrumb {
  id: string;
  name: string;
  slug: string;
}

export interface ProductDetailVariant {
  id: string;
  sku: string;
  title: string;
  priceInCents: number;
  compareAtPriceInCents: number | null;
  details: JsonValue;
  images: ProductImage[] | null;
  inStock: boolean;
}

export interface ProductDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  categorias: CategoryBreadcrumb[];
  tags: string[];
  isFeatured: boolean;
  seoMetadata: JsonValue | null;
  status: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  variants: ProductDetailVariant[];
  isLikedByUser: boolean;
  variantPromotions: Record<string, readonly ProductDisplayPromotion[]>;
}
