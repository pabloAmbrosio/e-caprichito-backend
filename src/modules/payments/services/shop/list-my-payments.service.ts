import { db } from '../../../../lib/prisma';
import { Prisma, PaymentStatus } from '../../../../lib/prisma';
import { paymentSelect } from '../../payment.selects';
import { ListPaymentsQuery } from '../../schemas';

export const listMyPayments = async (userId: string, params: ListPaymentsQuery) => {
  const { page = 1, limit = 20, status } = params;

  const where: Prisma.PaymentWhereInput = {
    customerId: userId,
    ...(status && { status: status as PaymentStatus }),
  };

  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    db.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: paymentSelect,
    }),
    db.payment.count({ where }),
  ]);

  return {
    msg: "Pagos obtenidos",
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
