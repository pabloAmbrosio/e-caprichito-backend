import { executeSearch } from '../../../customer-search-engine';
import type { ListProductsFilters, AbstractProductRow } from '../../../customer-search-engine';
import type { ServiceResult } from '../../types';
import {
  evaluateDisplayPromotions,
  type ProductForPromoEvaluation,
  type ProductDisplayPromotion,
} from '../../../adapters';

interface UserContext {
  readonly userId: string;
  readonly customerRole: string | null;
}

interface AbstractProductWithPromotions extends AbstractProductRow {
  variantPromotions: Record<string, readonly ProductDisplayPromotion[]>;
}

interface PaginatedProductsWithPromotions {
  items: AbstractProductWithPromotions[];
  total: number;
}

export async function listProductsService(
  filters: ListProductsFilters = {},
  userContext: UserContext | null = null,
): Promise<ServiceResult<PaginatedProductsWithPromotions>> {

  const data = await executeSearch(filters);

  const allVariants: ProductForPromoEvaluation[] = data.items.flatMap((abstract) =>
    abstract.variantes.map((v) => ({
      productId: v.id,
      categoryId: abstract.categoryId,
      tags: abstract.tags,
      priceInCents: v.priceInCents,
      title: v.title,
    }))
  );

  const promosMap = allVariants.length > 0
    ? await evaluateDisplayPromotions({
        products: allVariants,
        userId: userContext?.userId ?? null,
        customerRole: userContext?.customerRole ?? null,
      })
    : new Map();

  const itemsWithPromotions: AbstractProductWithPromotions[] = data.items.map((abstract) => {
    const variantPromotions: Record<string, readonly ProductDisplayPromotion[]> = {};

    for (const variante of abstract.variantes) {
      const promos = promosMap.get(variante.id);
      if (promos && promos.length > 0) {
        variantPromotions[variante.id] = promos;
      }
    }

    return { ...abstract, variantPromotions };
  });

  return { msg: 'Productos obtenidos', data: { items: itemsWithPromotions, total: data.total } };
}
