import { db } from '../../../../lib/prisma';
import { paymentWithReviewerSelect } from '../../payment.selects';
import { PaymentNotFoundError } from '../../errors';

export const getPaymentDetail = async (paymentId: string) => {
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    select: paymentWithReviewerSelect,
  });

  if (!payment) {
    throw new PaymentNotFoundError(paymentId);
  }

  return { msg: "Detalle de pago obtenido", data: payment };
};
