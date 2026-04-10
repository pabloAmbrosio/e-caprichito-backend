import cron, { ScheduledTask } from 'node-cron';
import { PaymentExpirationRegistry } from '../registry/expiration-registry';
import { findExpiredPaymentsService } from '../services/find-expired-payments.service';
import { processExpiredPayment, logJobSummary, formatError } from '../helpers';

export const startPaymentExpirationJob = (
    registry: PaymentExpirationRegistry,
    interval: string
): ScheduledTask => {
    const task = cron.schedule(interval, async () => {
        const startTime = Date.now();
        let processedCount = 0;
        let failedCount = 0;

        try {
            const expiredPayments = await findExpiredPaymentsService();

            if (expiredPayments.length === 0) return;

            console.info(
                `[PaymentExpiration] Procesando ${expiredPayments.length} pago(s) expirado(s)`,
                JSON.stringify({
                    count: expiredPayments.length,
                    paymentIds: expiredPayments.map((p) => p.id),
                    timestamp: new Date().toISOString(),
                })
            );

            for (const payment of expiredPayments) {
                const result = await processExpiredPayment(payment, registry);
                result === 'processed' ? processedCount++ : failedCount++;
            }
        } catch (error: unknown) {
            const { message, stack } = formatError(error);
            console.error(
                '[PaymentExpiration] Error en cron job:',
                JSON.stringify({ error: message, stack, timestamp: new Date().toISOString() })
            );
        } finally {
            logJobSummary(processedCount, failedCount, startTime);
        }
    });

    console.info(`[PaymentExpiration] Cron job iniciado con intervalo: ${interval}`);
    return task;
};
