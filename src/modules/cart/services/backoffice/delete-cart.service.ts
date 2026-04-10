import { db } from "../../../../lib/prisma";
import { CartNotFoundError } from "../../errors";

export async function deleteCartService(cartId: string) {
  const cart = await db.cart.findUnique({
    where: { id: cartId },
    select: { id: true, deletedAt: true, customerId: true, activeFor: true },
  });

  if (!cart) throw new CartNotFoundError(cartId);

  await db.cart.update({
    where: { id: cartId },
    data: { deletedAt: new Date() },
  });

  if (cart.activeFor) {
    await db.user.update({
      where: { id: cart.customerId },
      data: { activeCartId: null },
    });
  }

  return { message: "carrito eliminado correctamente", data: { id: cartId } };
}
