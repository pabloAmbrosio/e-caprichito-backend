import { db } from "../../../../lib/prisma";
import { isInStock } from "../../adapters/inventory.adapter";
import { MAX_QUANTITY_PER_ITEM } from "../../cart.config";
import {
  CartItemNotFoundError,
  OutOfStockError,
  MaxQuantityExceededError,
} from "../../errors";

export async function updateCartItemQuantity(
  userId: string,
  productId: string,
  quantity: number,
) {
  if (quantity > MAX_QUANTITY_PER_ITEM) {
    throw new MaxQuantityExceededError(MAX_QUANTITY_PER_ITEM);
  }

  if (!(await isInStock(productId))) {
    throw new OutOfStockError(productId);
  }

  const item = await db.cartItem.findFirst({
    where: {
      productId,
      cart: { activeFor: { id: userId } },
    },
    select: { id: true },
  });

  if (!item) throw new CartItemNotFoundError(productId);

  return db.cartItem.update({
    where: { id: item.id },
    data: { quantity },
    select: { id: true, productId: true, quantity: true, updatedAt: true },
  });
}
