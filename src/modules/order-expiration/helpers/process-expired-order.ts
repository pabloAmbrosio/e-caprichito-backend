import { db } from '../../../lib/prisma';
import { ExpiredOrderData } from '../registry/expiration-handler.interface';
import { OrderExpirationRegistry } from '../registry/expiration-registry';
import { validateExpiredOrder } from './validate-expired-order';
import { revertOrderToPending } from './revert-order-to-pending';
import { formatError } from './format-error';

export const processExpiredOrder = async (
    order: ExpiredOrderData,
    registry: OrderExpirationRegistry
): Promise<'processed' | 'failed'> => {
    try {
        const validation = validateExpiredOrder(order);
        if (!validation.success) {
            await revertOrderToPending(order.id);
            return 'failed';
        }

        await db.$transaction(async (tx) => {
            await registry.executeAll(order, tx);
        }, { timeout: 15000 });

        return 'processed';
    } catch (error: unknown) {
        const { message, stack } = formatError(error);

        console.error(
            `[OrderExpiration] Error procesando orden ${order.id}:`,
            JSON.stringify({
                orderId: order.id,
                customerId: order.customerId,
                error: message,
                stack,
                timestamp: new Date().toISOString(),
            })
        );

        await revertOrderToPending(order.id);
        return 'failed';
    }
};
