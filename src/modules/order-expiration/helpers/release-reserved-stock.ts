import type { TxClient } from '../../order/services/types';

export const releaseReservedStock = async (
    tx: TxClient,
    items: Array<{ productId: string; quantity: number }>,
    orderId: string
): Promise<void> => {
    for (const item of items) {
        const inventory = await tx.inventory.findUnique({
            where: { productId: item.productId },
            select: { reservedStock: true },
        });

        if (!inventory) {
            console.warn(
                `[CancelOrderHandler] Inventario no encontrado para producto ${item.productId} en orden ${orderId}, saltando liberacion de stock`
            );
            continue;
        }

        const decrementAmount = Math.min(item.quantity, inventory.reservedStock);
        if (decrementAmount <= 0) {
            console.warn(
                `[CancelOrderHandler] reservedStock ya es 0 para producto ${item.productId} en orden ${orderId}, saltando`
            );
            continue;
        }

        await tx.inventory.update({
            where: { productId: item.productId },
            data: { reservedStock: { decrement: decrementAmount } },
        });
    }
};
