import { db } from "../../../../lib/prisma";
import { cartBackofficeSelect } from "../../cart.selects";
import { CartNotFoundError } from "../../errors";

export const getCartByIdService = async (cartId: string) => {
    const cart = await db.cart.findUnique({
        where: { id: cartId },
        select: cartBackofficeSelect,
    });

    if (!cart) throw new CartNotFoundError(cartId);

    return cart;
};
