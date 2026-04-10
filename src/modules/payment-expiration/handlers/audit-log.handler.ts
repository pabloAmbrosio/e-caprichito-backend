import { PaymentExpirationHandler, ExpiredPaymentData } from '../registry/expiration-handler.interface';

export class PaymentAuditLogHandler implements PaymentExpirationHandler {
  name = 'PaymentAuditLogHandler';

  async execute(payment: ExpiredPaymentData): Promise<void> {
    console.log(
      `[PaymentExpiration][Audit] Pago expirado:`,
      JSON.stringify({
        paymentId: payment.id,
        orderId: payment.orderId,
        customerId: payment.customerId,
        amount: payment.amount,
        method: payment.method,
        createdAt: payment.createdAt.toISOString(),
        expiredAt: new Date().toISOString(),
      })
    );
  }
}
