import type { TxClient } from '../../order/services/types';
import { OrderExpirationHandler, ExpiredOrderData } from './expiration-handler.interface';
import { formatError } from '../helpers';

export class OrderExpirationRegistry {
    private handlers: OrderExpirationHandler[] = [];

    register(handler: OrderExpirationHandler): void {
        this.handlers.push(handler);
    }

    async executeAll(order: ExpiredOrderData, tx?: TxClient): Promise<void> {
        for (const handler of this.handlers) {
            try {
                await handler.execute(order, tx);
            } catch (error: unknown) {
                const { message, stack } = formatError(error);

                console.error(
                    `[OrderExpiration][Registry] Handler "${handler.name}" fallo para orden ${order.id}:`,
                    JSON.stringify({
                        orderId: order.id,
                        customerId: order.customerId,
                        handler: handler.name,
                        error: message,
                        stack,
                        timestamp: new Date().toISOString(),
                        itemsCount: order.items.length,
                    })
                );

                throw error;
            }
        }
    }
}
