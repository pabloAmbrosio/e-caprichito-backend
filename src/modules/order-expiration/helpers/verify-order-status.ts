import type { TxClient } from '../../order/services/types';

export const verifyOrderStatus = async (tx: TxClient, orderId: string): Promise<boolean> => {
    const currentOrder = await tx.order.findUnique({
        where: { id: orderId },
        select: { status: true },
    });

    if (!currentOrder) {
        throw new Error(`[CancelOrderHandler] Orden ${orderId} no encontrada en BD`);
    }

    if (currentOrder.status !== 'CANCELLED') {
        console.warn(
            `[CancelOrderHandler] Orden ${orderId} ya no esta en CANCELLED (actual: ${currentOrder.status}), saltando`
        );
        return false;
    }

    return true;
};
