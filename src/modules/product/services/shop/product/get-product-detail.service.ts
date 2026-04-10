import type { ServiceResult } from '../../types';
import type { ProductDetail } from '../../types/product/product-detail.types';
import { findProductOrFail } from '../../helpers/product/find-product-or-fail';
import { buildCategoryBreadcrumb } from '../../helpers/product/build-category-breadcrumb';
import { checkUserLike } from '../../helpers/like/check-user-like';
import { mapToProductDetail } from '../../helpers/product/map-to-product-detail';
import {
  evaluateDisplayPromotions,
  type ProductForPromoEvaluation,
  type ProductDisplayPromotion,
} from '../../../adapters';

interface UserContext {
  readonly userId: string;
  readonly customerRole: string | null;
}

export const getProductDetailService = async (
  idOrSlug: string,
  userContext: UserContext | null = null,
): Promise<ServiceResult<ProductDetail>> => {
  const raw = await findProductOrFail(idOrSlug);

  const allVariants: ProductForPromoEvaluation[] = raw.products.map((v) => ({
    productId: v.id,
    categoryId: raw.categoryId,
    tags: raw.tags,
    priceInCents: v.priceInCents,
    title: v.title,
  }));

  const [categorias, isLikedByUser, promosMap] = await Promise.all([
    buildCategoryBreadcrumb(raw.categoryId),
    checkUserLike(raw.id, userContext?.userId),
    allVariants.length > 0
      ? evaluateDisplayPromotions({
          products: allVariants,
          userId: userContext?.userId ?? null,
          customerRole: userContext?.customerRole ?? null,
        })
      : Promise.resolve(new Map()),
  ]);

  const variantPromotions: Record<string, readonly ProductDisplayPromotion[]> = {};
  for (const variant of raw.products) {
    const promos = promosMap.get(variant.id);
    if (promos && promos.length > 0) {
      variantPromotions[variant.id] = promos;
    }
  }

  const data = mapToProductDetail(raw, categorias, isLikedByUser, variantPromotions);

  return { msg: 'Producto encontrado', data };
};
