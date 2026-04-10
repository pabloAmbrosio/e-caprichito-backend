import { db } from "../../../../lib/prisma";
import { validateCoupon } from "../../adapters/promotion.adapter";
import { CartNotFoundError } from "../../errors";

export async function applyCouponToCart(userId: string, couponCode: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { activeCartId: true },
  });

  if (!user?.activeCartId) {
    throw new CartNotFoundError(userId);
  }

  await validateCoupon(couponCode, userId);

  return db.cart.update({
    where: { id: user.activeCartId, deletedAt: null },
    data: { couponCode },
    select: { id: true, couponCode: true },
  });
}
