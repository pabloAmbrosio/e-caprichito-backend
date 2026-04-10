import { db } from "../../../../lib/prisma";
import { CartNotFoundError } from "../../errors";

export async function removeCouponFromCart(userId: string) {
  const { count } = await db.cart.updateMany({
    where: {
      activeFor: { id: userId },
      deletedAt: null,
    },
    data: { couponCode: null },
  });

  if (count === 0) throw new CartNotFoundError(userId);
}
