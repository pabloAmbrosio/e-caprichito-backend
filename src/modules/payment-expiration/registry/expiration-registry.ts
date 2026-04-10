import { PaymentExpirationHandler, ExpiredPaymentData } from './expiration-handler.interface';
import { formatError } from '../helpers';

export class PaymentExpirationRegistry {
    private handlers: PaymentExpirationHandler[] = [];

    register(handler: PaymentExpirationHandler): void {
        this.handlers.push(handler);
    }

    async executeAll(payment: ExpiredPaymentData): Promise<void> {
        for (const handler of this.handlers) {
            try {
                await handler.execute(payment);
            } catch (error: unknown) {
                const { message, stack } = formatError(error);

                console.error(
                    `[PaymentExpiration] Handler "${handler.name}" fallo para pago ${payment.id}:`,
                    JSON.stringify({
                        paymentId: payment.id,
                        orderId: payment.orderId,
                        customerId: payment.customerId,
                        handler: handler.name,
                        error: message,
                        stack,
                        timestamp: new Date().toISOString(),
                    })
                );
            }
        }
    }
}
