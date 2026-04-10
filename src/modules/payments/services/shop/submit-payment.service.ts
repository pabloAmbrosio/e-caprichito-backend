import * as v from 'valibot';
import { db as defaultDb } from '../../../../lib/prisma';
import { Prisma, PaymentMethod } from '../../../../lib/prisma';
import { SubmitPaymentInput } from '../../schemas';
import { getProvider } from '../../providers';
import { paymentSelect } from '../../payment.selects';
import { PAYMENT_AMOUNT_LIMITS } from '../../constants';
import {
  OrderNotFoundError,
  OrderNotOwnedError,
  OrderNotPendingError,
  PaymentAlreadyExistsError,
  PaymentAmountMismatchError,
  PaymentAmountOutOfRangeError,
  CodSubmitNotAllowedError,
} from '../../errors';

// Validates providerData structure before storing as JSON in DB
const ProviderDataSchema = v.nullable(
  v.record(v.string(), v.unknown())
);

export const submitPayment = async (data: SubmitPaymentInput, userId: string, dbClient = defaultDb) => {
  if (data.method === 'CASH_ON_DELIVERY') {
    throw new CodSubmitNotAllowedError();
  }

  const result = await dbClient.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: data.orderId },
      select: {
        id: true,
        customerId: true,
        status: true,
        discountTotalInCents: true,
        items: {
          select: {
            quantity: true,
            product: {
              select: {
                priceInCents: true,
              },
            },
          },
        },
        shipment: {
          select: { deliveryFee: true },
        },
      },
    });

    if (!order) {
      throw new OrderNotFoundError();
    }

    if (order.customerId !== userId) {
      throw new OrderNotOwnedError();
    }

    if (order.status !== 'PENDING') {
      throw new OrderNotPendingError();
    }

    const activePayment = await tx.payment.findFirst({
      where: {
        orderId: data.orderId,
        status: { in: ['PENDING', 'AWAITING_REVIEW'] },
      },
    });

    if (activePayment) {
      throw new PaymentAlreadyExistsError();
    }

    const totalInCents = order.items.reduce((sum, item) => {
      return sum + (item.product.priceInCents * item.quantity);
    }, 0);

    const discountInCents = order.discountTotalInCents ?? 0;
    const deliveryFee = order.shipment?.deliveryFee ?? 0;
    const finalAmount = totalInCents - discountInCents + deliveryFee;

    if (finalAmount <= 0) {
      throw new PaymentAmountMismatchError(totalInCents, finalAmount);
    }

    if (finalAmount < PAYMENT_AMOUNT_LIMITS.MIN_CENTS || finalAmount > PAYMENT_AMOUNT_LIMITS.MAX_CENTS) {
      throw new PaymentAmountOutOfRangeError(
        PAYMENT_AMOUNT_LIMITS.MIN_CENTS,
        PAYMENT_AMOUNT_LIMITS.MAX_CENTS,
        finalAmount
      );
    }

    const provider = getProvider(data.method as PaymentMethod);
    const providerResult = await provider.initiate(data.orderId, finalAmount);

    const providerDataResult = v.safeParse(ProviderDataSchema, providerResult.providerData);
    const safeProviderData = providerDataResult.success
      ? (providerDataResult.output as Prisma.InputJsonValue) ?? Prisma.JsonNull
      : Prisma.JsonNull;

    const payment = await tx.payment.create({
      data: {
        orderId: data.orderId,
        customerId: userId,
        method: data.method as PaymentMethod,
        status: 'PENDING',
        amount: finalAmount,
        currency: 'MXN',
        providerData: safeProviderData,
      },
      select: paymentSelect,
    });

    return payment;
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  });

  return { msg: "Pago creado. Sube tu comprobante de pago.", data: result };
};
