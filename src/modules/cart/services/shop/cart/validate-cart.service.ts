import type { CartIssue, ValidateCartResult } from "../../../types/validate-cart.types";
import { fetchFreshProducts, checkAvailability, checkPriceChange, checkStock } from "../../../helpers/cart";
import { checkCoupon } from "../../../helpers/coupon";
import { getActiveCartService } from "./get-active-cart.service";

// Collects all issues (stock, prices, coupon) instead of failing on the first one
export async function validateCartService(userId: string): Promise<ValidateCartResult> {
  const { data: cart } = await getActiveCartService(userId);

  if (!cart || cart.items.length === 0) {
    return {
      message: "El carrito está vacío",
      data: { valid: false, issues: [] },
    };
  }

  const issues: CartIssue[] = [];

  const productIds = cart.items.map((i) => i.productId);
  const freshMap = await fetchFreshProducts(productIds);

  for (const item of cart.items) {
    const fresh = freshMap.get(item.productId);

    const unavailable = checkAvailability(item, fresh);
    if (unavailable) {
      issues.push(unavailable);
      continue;
    }

    const priceChanged = checkPriceChange(item, fresh!);
    if (priceChanged) issues.push(priceChanged);

    const outOfStock = await checkStock(item);
    if (outOfStock) issues.push(outOfStock);
  }

  if (cart.couponCode) {
    const couponIssue = await checkCoupon(cart.couponCode, userId);
    if (couponIssue) issues.push(couponIssue);
  }

  const valid = issues.length === 0;

  return {
    message: valid
      ? "Carrito validado correctamente"
      : "El carrito tiene problemas que resolver",
    data: { valid, issues },
  };
}
