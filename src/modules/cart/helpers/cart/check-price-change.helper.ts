import type { ValidateCartItem, FreshProduct, CartIssue } from "../../types/validate-cart.types";

export function checkPriceChange(item: ValidateCartItem, fresh: FreshProduct): CartIssue | null {
  if (fresh.priceInCents !== item.product.priceInCents) {
    return {
      type: "PRICE_CHANGED",
      productId: item.productId,
      detail: `El precio de "${item.product.title}" cambió`,
    };
  }
  return null;
}
