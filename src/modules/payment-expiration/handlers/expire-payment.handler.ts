import { db } from '../../../lib/prisma';
import { PaymentExpirationHandler, ExpiredPaymentData } from '../registry/expiration-handler.interface';

export class ExpirePaymentHandler implements PaymentExpirationHandler {
  name = 'ExpirePaymentHandler';

  async execute(payment: ExpiredPaymentData): Promise<void> {
    await db.payment.update({
      where: { id: payment.id },
      data: { status: 'EXPIRED' },
    });
  }
}
