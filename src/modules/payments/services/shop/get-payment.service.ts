import { db } from '../../../../lib/prisma';
import { paymentSelect } from '../../payment.selects';
import { PaymentNotFoundError, PaymentNotOwnedError } from '../../errors';

export const getPaymentById = async (paymentId: string, userId: string) => {
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    select: paymentSelect,
  });

  if (!payment) {
    throw new PaymentNotFoundError(paymentId);
  }

  if (payment.customerId !== userId) {
    throw new PaymentNotOwnedError();
  }

  return { msg: "Pago obtenido", data: payment };
};
