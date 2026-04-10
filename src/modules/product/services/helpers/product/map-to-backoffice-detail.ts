import type { RawBackofficeProduct } from './find-product-backoffice-or-fail';
import type { BackofficeProductDetail, BackofficeVariant } from '../../types/product/backoffice-product-detail.types';
import type { ProductImage } from '../../../types';

export const mapToBackofficeDetail = (raw: RawBackofficeProduct): BackofficeProductDetail => {
  const variants: BackofficeVariant[] = raw.products.map((v) => {
    const physicalStock = v.inventory?.physicalStock ?? 0;
    const reservedStock = v.inventory?.reservedStock ?? 0;

    return {
      id: v.id,
      abstractProductId: v.abstractProductId,
      sku: v.sku,
      title: v.title,
      priceInCents: v.priceInCents,
      compareAtPriceInCents: v.compareAtPriceInCents,
      details: v.details,
      images: v.images as ProductImage[] | null,
      status: v.status,
      createdBy: v.createdBy,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
      physicalStock,
      reservedStock,
      availableStock: physicalStock - reservedStock,
    };
  });

  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    description: raw.description,
    categoryId: raw.categoryId,
    tags: raw.tags,
    isFeatured: raw.isFeatured,
    seoMetadata: raw.seoMetadata,
    status: raw.status,
    publishedAt: raw.publishedAt,
    createdBy: raw.createdBy,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    totalLikes: raw._count.productLikes,
    variants,
  };
};
