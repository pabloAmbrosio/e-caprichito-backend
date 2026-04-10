import { applyPromotionsService } from "../../promotions/services/shop/apply-promotions.service";
import { validateCouponService } from "../../promotions/services/shop/validate-coupon.service";
import { ERROR_MESSAGES } from "../../promotions/constants";

export interface CartPromotionItem {
    readonly productId: string;
    readonly categoryId: string;
    readonly tags: readonly string[];
    readonly priceInCents: number;
    readonly quantity: number;
    readonly title: string;
}

export interface CartAppliedPromotion {
    readonly promotionId: string;
    readonly promotionName: string;
    readonly discountAmountInCents: number;
    readonly actionType: string;
}

export interface CartPromotionResult {
    readonly originalTotalInCents: number;
    readonly finalTotalInCents: number;
    readonly totalDiscountInCents: number;
    readonly appliedPromotions: readonly CartAppliedPromotion[];
}

interface EvaluateCartPromotionsInput {
    readonly userId: string;
    readonly customerRole: string | null;
    readonly cartItems: readonly CartPromotionItem[];
    readonly cartTotalInCents: number;
    readonly couponCode?: string;
}

export const evaluateCartPromotions = async (
    input: EvaluateCartPromotionsInput,
): Promise<CartPromotionResult> => {
    return applyPromotionsService(input);
};

export const validateCoupon = async (couponCode: string, userId: string) => {
    return validateCouponService(couponCode, userId);
};

export const COUPON_ERRORS = [
    ERROR_MESSAGES.COUPON_NOT_FOUND,
    ERROR_MESSAGES.PROMOTION_NOT_ACTIVE,
    ERROR_MESSAGES.PROMOTION_NOT_STARTED,
    ERROR_MESSAGES.PROMOTION_EXPIRED,
    ERROR_MESSAGES.MAX_USES_REACHED,
] as const;
