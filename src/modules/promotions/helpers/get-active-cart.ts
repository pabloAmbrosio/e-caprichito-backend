import type { DbClientOrTx } from '../../../lib/prisma';
import { CartError } from '../errors';
import { cartWithItemsForEngineInclude } from '../promotion.selects';

export const getActiveCart = async (tx: DbClientOrTx, userId: string) => {
    const user = await (tx as any).user.findUnique({
        where: { id: userId },
        select: { activeCartId: true },
    });

    if (!user?.activeCartId) {
        throw new CartError('No se encontro un carrito activo para el usuario');
    }

    const cart = await (tx as any).cart.findUnique({
        where: { id: user.activeCartId, deletedAt: null },
        include: cartWithItemsForEngineInclude,
    });

    if (!cart) {
        throw new CartError('No se encontro un carrito activo para el usuario');
    }

    if (cart.items.length === 0) {
        throw new CartError('El carrito esta vacio. Agrega productos antes de aplicar un cupon');
    }

    return cart;
};
