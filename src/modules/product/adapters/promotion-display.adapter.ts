import { applyDisplayPromotionsService } from '../../promotions/services/shop/apply-display-promotions.service';

export interface ProductForPromoEvaluation {
  readonly productId: string;
  readonly categoryId: string;
  readonly tags: readonly string[];
  readonly priceInCents: number;
  readonly title: string;
}

export interface ProductDisplayPromotion {
  readonly promotionId: string;
  readonly promotionName: string;
  readonly description: string | null;
  readonly actionType: 'PERCENTAGE_DISCOUNT' | 'BUY_X_GET_Y';
  readonly actionValue: string;
  readonly originalPriceInCents: number;
  readonly discountAmountInCents: number;
  readonly finalPriceInCents: number;
  readonly discountPercentage: number | null;
  readonly display: {
    readonly badgeText: string | null;
    readonly badgeColor: string | null;
    readonly colorPrimary: string | null;
    readonly colorSecondary: string | null;
  };
}

export interface EvaluateDisplayPromotionsInput {
  readonly products: readonly ProductForPromoEvaluation[];
  readonly userId: string | null;
  readonly customerRole: string | null;
}

export type DisplayPromotionsMap = ReadonlyMap<string, readonly ProductDisplayPromotion[]>;

export const evaluateDisplayPromotions = async (
  input: EvaluateDisplayPromotionsInput
): Promise<DisplayPromotionsMap> => {


  const result = await applyDisplayPromotionsService({
    products: input.products,
    userId: input.userId,
    customerRole: input.customerRole,
  });

  return result.productPromotions as DisplayPromotionsMap;
};
