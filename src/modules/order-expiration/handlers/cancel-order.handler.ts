import type { TxClient } from '../../order/services/types';
import { OrderExpirationHandler, ExpiredOrderData } from '../registry/expiration-handler.interface';
import {
    verifyOrderStatus,
    clearExpiresAt,
    releaseReservedStock,
    deletePromotionUsages,
} from '../helpers';

export class CancelOrderHandler implements OrderExpirationHandler {
    name = 'CancelOrderHandler';

    async execute(order: ExpiredOrderData, tx?: TxClient): Promise<void> {
        if (!tx) {
            throw new Error(`[CancelOrderHandler] Se requiere cliente transaccional para orden ${order.id}`);
        }

        const shouldProcess = await verifyOrderStatus(tx, order.id);
        if (!shouldProcess) return;

        await clearExpiresAt(tx, order.id);
        await releaseReservedStock(tx, order.items, order.id);
        await deletePromotionUsages(tx, order.id);
    }
}
