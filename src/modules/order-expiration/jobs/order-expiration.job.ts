import cron, { ScheduledTask } from 'node-cron';
import { OrderExpirationRegistry } from '../registry/expiration-registry';
import { findExpiredOrdersService } from '../services/find-expired-orders.service';
import { processExpiredOrder, logJobSummary, formatError } from '../helpers';

export const startOrderExpirationJob = (
    registry: OrderExpirationRegistry,
    interval: string
): ScheduledTask => {
    const task = cron.schedule(interval, async () => {
        const startTime = Date.now();
        let processedCount = 0;
        let failedCount = 0;

        try {
            const expiredOrders = await findExpiredOrdersService();

            if (expiredOrders.length === 0) return;

            console.info(
                `[OrderExpiration] Procesando ${expiredOrders.length} orden(es) expirada(s)`,
                JSON.stringify({
                    count: expiredOrders.length,
                    orderIds: expiredOrders.map((o) => o.id),
                    timestamp: new Date().toISOString(),
                })
            );

            for (const order of expiredOrders) {
                const result = await processExpiredOrder(order, registry);
                result === 'processed' ? processedCount++ : failedCount++;
            }
        } catch (error: unknown) {
            const { message, stack } = formatError(error);
            console.error(
                '[OrderExpiration] Error en cron job:',
                JSON.stringify({ error: message, stack, timestamp: new Date().toISOString() })
            );
        } finally {
            logJobSummary(processedCount, failedCount, startTime);
        }
    });

    console.info(`[OrderExpiration] Cron job iniciado con intervalo: ${interval}`);
    return task;
};
