import type { RawLikedProduct } from './find-liked-products';
import type { LikedProductItem, ProductDetailVariant } from '../../types';
import type { ProductImage } from '../../../types';

export const mapToLikedProduct = (raw: RawLikedProduct): LikedProductItem => {
  const { abstractProduct: ap } = raw;

  const variants: ProductDetailVariant[] = ap.products.map((v) => {
    const physical = v.inventory?.physicalStock ?? 0;
    const reserved = v.inventory?.reservedStock ?? 0;

    return {
      id: v.id,
      sku: v.sku,
      title: v.title,
      priceInCents: v.priceInCents,
      compareAtPriceInCents: v.compareAtPriceInCents,
      details: v.details,
      images: v.images as ProductImage[] | null,
      inStock: (physical - reserved) > 0,
    };
  });

  return {
    likedAt: raw.createdAt,
    product: {
      id: ap.id,
      title: ap.title,
      slug: ap.slug,
      description: ap.description,
      categoryId: ap.categoryId,
      tags: ap.tags,
      isFeatured: ap.isFeatured,
      status: ap.status,
      publishedAt: ap.publishedAt,
      variants,
    },
  };
};
