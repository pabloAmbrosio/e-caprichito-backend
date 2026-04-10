import type { TxClient } from "../types/tx-client.types";
import { CartNotFoundError } from "../../adapters/cart.adapter";
import { activeCartTxSelect } from "../../order.selects";

export async function getCartOrFail(tx: TxClient, userId: string) {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: {
      activeCart: { select: activeCartTxSelect },
    },
  });

  if (!user?.activeCart || user.activeCart.items.length === 0) {
    throw new CartNotFoundError(userId);
  }

  return user.activeCart;
}
