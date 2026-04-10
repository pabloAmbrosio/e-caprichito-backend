import { db } from '../../../lib/prisma';
import { PAYMENT_EXPIRATION } from '../../payments/constants';
import { ExpiredPaymentData } from '../registry/expiration-handler.interface';

export const findExpiredPaymentsService = async (): Promise<ExpiredPaymentData[]> => {
  const expirationDate = new Date(Date.now() - PAYMENT_EXPIRATION.PENDING_TTL_MS);

  const expiredPayments = await db.payment.findMany({
    where: {
      status: 'PENDING',
      createdAt: { lte: expirationDate },
      method: { not: 'CASH_ON_DELIVERY' },
    },
    select: {
      id: true,
      orderId: true,
      customerId: true,
      amount: true,
      method: true,
      createdAt: true,
    },
  });

  return expiredPayments;
};
