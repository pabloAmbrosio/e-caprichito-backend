import { isInStock } from "../../adapters/inventory.adapter";
import type { ValidateCartItem, CartIssue } from "../../types/validate-cart.types";

export async function checkStock(item: ValidateCartItem): Promise<CartIssue | null> {
  const available = await isInStock(item.productId);
  if (!available) {
    return {
      type: "OUT_OF_STOCK",
      productId: item.productId,
      detail: `"${item.product.title}" está agotado`,
    };
  }
  return null;
}
