import { db } from '../../../../lib/prisma';
import { Prisma, PaymentStatus } from '../../../../lib/prisma';
import { paymentWithReviewerSelect } from '../../payment.selects';
import { ListPaymentsQuery } from '../../schemas';

export const listAllPayments = async (params: ListPaymentsQuery) => {
  const { page = 1, limit = 20, status } = params;

  const where: Prisma.PaymentWhereInput = {
    ...(status && { status: status as PaymentStatus }),
  };

  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    db.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: paymentWithReviewerSelect,
    }),
    db.payment.count({ where }),
  ]);

  return {
    msg: "Pagos listados",
    data: {
      items: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  };
};
