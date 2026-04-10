import type { ValidateCartItem, FreshProduct, CartIssue } from "../../types/validate-cart.types";

export function checkAvailability(item: ValidateCartItem, fresh?: FreshProduct): CartIssue | null {
  if (!fresh || fresh.deletedAt) {
    return {
      type: "PRODUCT_UNAVAILABLE",
      productId: item.productId,
      detail: `"${item.product.title}" ya no está disponible`,
    };
  }
  return null;
}
