import { db } from "../../../../../lib/prisma";
import { cartSummarySelect } from "../../../cart.selects";


export const getCartSummaryService = async (customerId: string) => {

    const user = await db.user.findUnique({
        where: { id: customerId },
        select: {
            activeCart: { select: cartSummarySelect },
        },
    });

    const cart = user?.activeCart;
    if (!cart) return { message: "resumen del carrito obtenido correctamente", data: null };

    let totalItems = 0;
    let subtotalInCents = 0;

    for (const item of cart.items) {
        totalItems += item.quantity;
        subtotalInCents += item.product.priceInCents * item.quantity;
    }

    return {
        message: "resumen del carrito obtenido correctamente",
        data: {
            cartId: cart.id,
            totalItems,
            subtotalInCents,
            hasCoupon: cart.couponCode !== null,
        },
    };
};
