import type { TxClient } from "../types/tx-client.types";

export async function rotateCart(
  tx: TxClient,
  userId: string,
  cartId: string,
) {
  await tx.cart.update({
    where: { id: cartId },
    data: { deletedAt: new Date() },
  });

  const newCart = await tx.cart.create({
    data: { customerId: userId },
  });

  await tx.user.update({
    where: { id: userId },
    data: { activeCartId: newCart.id },
  });
}
