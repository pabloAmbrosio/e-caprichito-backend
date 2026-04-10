import { db } from "../../../../../lib/prisma";
import { CartNotFoundError } from "../../../errors";
import { getActiveCartService } from "./get-active-cart.service";
import { buildCartWithPromotions } from "../../shared";

export async function restoreCart(userId: string, customerRole: string | null, cartId: string) {
  const cart = await db.cart.findUnique({
    where: { id: cartId },
    select: { customerId: true, deletedAt: true },
  });

  if (!cart || cart.customerId !== userId) {
    throw new CartNotFoundError(cartId);
  }

  await db.$transaction([
    db.cart.update({
      where: { id: cartId },
      data: { deletedAt: null },
    }),
    db.user.update({
      where: { id: userId },
      data: { activeCartId: cartId },
    }),
  ]);

  const { data: restoredCart } = await getActiveCartService(userId);
  const data = restoredCart
    ? await buildCartWithPromotions(restoredCart, userId, customerRole)
    : null;

  return { message: "carrito restaurado correctamente", data };
}
