import { db } from "../../../../../lib/prisma";
import { cartSelect } from "../../../cart.selects";
import { CartNotFoundError } from "../../../errors";

export async function emptyCartService(userId: string) {
  const data = await db.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { activeCartId: true },
    });

    if (!user?.activeCartId) throw new CartNotFoundError(userId);

    await tx.cart.update({
      where: { id: user.activeCartId },
      data: { deletedAt: new Date() },
    });

    const newCart = await tx.cart.create({
      data: { customerId: userId },
      select: cartSelect,
    });

    await tx.user.update({
      where: { id: userId },
      data: { activeCartId: newCart.id },
    });

    return newCart;
  });

  return { message: "carrito vaciado correctamente", data };
}
