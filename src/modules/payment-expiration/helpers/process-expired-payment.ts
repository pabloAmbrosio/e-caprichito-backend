import { ExpiredPaymentData } from '../registry/expiration-handler.interface';
import { PaymentExpirationRegistry } from '../registry/expiration-registry';
import { formatError } from './format-error';

export const processExpiredPayment = async (
    payment: ExpiredPaymentData,
    registry: PaymentExpirationRegistry
): Promise<'processed' | 'failed'> => {
    try {
        await registry.executeAll(payment);
        return 'processed';
    } catch (error: unknown) {
        const { message, stack } = formatError(error);

        console.error(
            `[PaymentExpiration] Error procesando pago ${payment.id}:`,
            JSON.stringify({
                paymentId: payment.id,
                orderId: payment.orderId,
                customerId: payment.customerId,
                error: message,
                stack,
                timestamp: new Date().toISOString(),
            })
        );

        return 'failed';
    }
};
