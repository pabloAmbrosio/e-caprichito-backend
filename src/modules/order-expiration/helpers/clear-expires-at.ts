import type { TxClient } from '../../order/services/types';

export const clearExpiresAt = async (tx: TxClient, orderId: string): Promise<void> => {
    await tx.order.update({
        where: { id: orderId },
        data: { expiresAt: null },
    });
};
