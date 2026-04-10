import type { Prisma } from '../../../../../lib/prisma';
import type { ProductImage } from '../../../types';

type JsonValue = Prisma.JsonValue;

export interface BackofficeVariant {
  id: string;
  abstractProductId: string;
  sku: string;
  title: string;
  priceInCents: number;
  compareAtPriceInCents: number | null;
  details: JsonValue;
  images: ProductImage[] | null;
  status: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  physicalStock: number;
  reservedStock: number;
  availableStock: number;
}

export interface BackofficeProductDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  tags: string[];
  isFeatured: boolean;
  seoMetadata: JsonValue | null;
  status: string;
  publishedAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  totalLikes: number;
  variants: BackofficeVariant[];
}
