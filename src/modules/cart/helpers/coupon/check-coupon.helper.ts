import { validateCoupon } from "../../adapters/promotion.adapter";
import type { CartIssue } from "../../types/validate-cart.types";

export async function checkCoupon(couponCode: string, userId: string): Promise<CartIssue | null> {
  try {
    await validateCoupon(couponCode, userId);
    return null;
  } catch {
    return {
      type: "COUPON_INVALID",
      detail: `El cupón "${couponCode}" ya no es válido`,
    };
  }
}
