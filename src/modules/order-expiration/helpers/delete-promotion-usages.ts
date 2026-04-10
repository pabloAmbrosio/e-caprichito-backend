import type { TxClient } from '../../order/services/types';

export const deletePromotionUsages = async (tx: TxClient, orderId: string): Promise<void> => {
    await tx.promotionUsage.deleteMany({
        where: { orderId },
    });
};
