import { db } from "../../../../lib/prisma";
import { CartItemNotFoundError } from "../../errors";

export async function removeCartItem(userId: string, productId: string) {
  const { count } = await db.cartItem.deleteMany({
    where: {
      productId,
      cart: {
        activeFor: { id: userId },
      },
    },
  });

  if (count === 0) {
    throw new CartItemNotFoundError(productId);
  }
}
