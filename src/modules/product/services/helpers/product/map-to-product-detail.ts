import type { RawProductDetail } from './find-product-or-fail';
import type {
  CategoryBreadcrumb,
  ProductDetail,
  ProductDetailVariant,
} from '../../types/product/product-detail.types';
import type { ProductImage } from '../../../types';
import type { ProductDisplayPromotion } from '../../../adapters';

export const mapToProductDetail = (
  raw: RawProductDetail,
  categorias: CategoryBreadcrumb[],
  isLikedByUser: boolean,
  variantPromotions: Record<string, readonly ProductDisplayPromotion[]> = {},
): ProductDetail => {
  const variants: ProductDetailVariant[] = raw.products.map((variant) => {
    const physical = variant.inventory?.physicalStock ?? 0;
    const reserved = variant.inventory?.reservedStock ?? 0;

    return {
      id: variant.id,
      sku: variant.sku,
      title: variant.title,
      priceInCents: variant.priceInCents,
      compareAtPriceInCents: variant.compareAtPriceInCents,
      details: variant.details,
      images: variant.images as ProductImage[] | null,
      inStock: (physical - reserved) > 0,
    };
  });

  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    description: raw.description,
    categoryId: raw.categoryId,
    categorias,
    tags: raw.tags,
    isFeatured: raw.isFeatured,
    seoMetadata: raw.seoMetadata,
    status: raw.status,
    publishedAt: raw.publishedAt,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    variants,
    isLikedByUser,
    variantPromotions,
  };
};
