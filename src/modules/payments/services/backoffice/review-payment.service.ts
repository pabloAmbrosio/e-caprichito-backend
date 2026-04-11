import { db as defaultDb } from '../../../../lib/prisma';
import { Prisma } from '../../../../lib/prisma';
import { paymentWithReviewerSelect } from '../../payment.selects';
import { ReviewPaymentBody } from '../../schemas';
import { REVIEWER_ALLOWED_ROLES } from '../../constants';
import {
  PaymentNotFoundError,
  PaymentNotAwaitingReviewError,
  InsufficientStockError,
  UnauthorizedReviewerError,
  OrderNotPendingError,
} from '../../errors';
import { getNextStatus } from '../../../shipment/helpers';
import { logStatusChange } from '../../../order/services/helpers/log-status-change';

const auditLog = (action: string, details: Record<string, unknown>) => {
  console.log(
    `[PaymentReview][Audit] ${action}:`,
    JSON.stringify({
      ...details,
      timestamp: new Date().toISOString(),
    })
  );
};

export const reviewPayment = async (
  paymentId: string,
  data: ReviewPaymentBody,
  reviewerId: string,
  reviewerRole?: string,
  dbClient = defaultDb
) => {
  // Defense-in-depth: validate reviewer role even though routes already check via requireRoles
  if (reviewerRole && !(REVIEWER_ALLOWED_ROLES as readonly string[]).includes(reviewerRole)) {
    auditLog('UNAUTHORIZED_REVIEW_ATTEMPT', {
      paymentId,
      reviewerId,
      reviewerRole,
      action: data.action,
    });
    throw new UnauthorizedReviewerError();
  }

  const payment = await dbClient.payment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      status: true,
      orderId: true,
      amount: true,
      method: true,
      customerId: true,
      order: {
        select: {
          id: true,
          status: true,
          shipment: {
            select: { id: true, status: true, type: true },
          },
          items: {
            select: {
              quantity: true,
              productId: true,
              product: {
                select: {
                  id: true,
                  title: true,
                  inventory: {
                    select: {
                      physicalStock: true,
                      reservedStock: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new PaymentNotFoundError(paymentId);
  }

  if (payment.status !== 'AWAITING_REVIEW') {
    throw new PaymentNotAwaitingReviewError();
  }

  // Verificar que la orden siga en un estado válido para revisión
  if (payment.order.status === 'CANCELLED') {
    throw new OrderNotPendingError();
  }

  // === REJECT ===

  if (data.action === 'REJECT') {
    const rejectedPayment = await dbClient.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'REJECTED',
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          reviewNote: data.note || null,
        },
        select: paymentWithReviewerSelect,
      });

      for (const item of payment.order.items) {
        await tx.inventory.update({
          where: { productId: item.product.id },
          data: {
            reservedStock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return updated;
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });

    auditLog('PAYMENT_REJECTED', {
      paymentId,
      orderId: payment.orderId,
      customerId: payment.customerId,
      reviewerId,
      reviewerRole: reviewerRole ?? 'unknown',
      amount: payment.amount,
      note: data.note || null,
    });

    return { msg: "Pago rechazado exitosamente", data: rejectedPayment };
  }

  // === APPROVE: verify stock ===

  for (const item of payment.order.items) {
    const inventory = item.product.inventory;

    if (!inventory) {
      throw new InsufficientStockError(
        `${item.product.title} no tiene inventario registrado`
      );
    }

    if (inventory.physicalStock < item.quantity) {
      throw new InsufficientStockError(
        `${item.product.title} (disponible: ${inventory.physicalStock}, requerido: ${item.quantity})`
      );
    }
  }

  // === APPROVE: atomic transaction ===

  const approvedPayment = await dbClient.$transaction(async (tx) => {
    const updated = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: 'APPROVED',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reviewNote: data.note || null,
      },
      select: paymentWithReviewerSelect,
    });

    const previousOrderStatus = payment.order.status;
    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: 'CONFIRMED', expiresAt: null },
    });

    if (previousOrderStatus === 'PENDING') {
      await logStatusChange(tx, payment.orderId, reviewerId, previousOrderStatus, 'CONFIRMED', true);
    }

    // Confirm reservation: decrement both physicalStock and reservedStock
    for (const item of payment.order.items) {
      await tx.inventory.update({
        where: { productId: item.product.id },
        data: {
          physicalStock: {
            decrement: item.quantity,
          },
          reservedStock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Auto-advance Shipment PENDING → PREPARING
    let shipmentNotification = null;
    const shipment = payment.order.shipment;
    if (shipment && shipment.status === "PENDING") {
      const nextStatus = getNextStatus(shipment.type, shipment.status);

      await tx.shipment.update({
        where: { id: shipment.id },
        data: { status: nextStatus },
      });

      await tx.shipmentEvent.create({
        data: {
          shipmentId: shipment.id,
          staffId: reviewerId,
          status: nextStatus,
          note: "Pago aprobado — envio iniciado automaticamente",
        },
      });

      shipmentNotification = {
        orderId: payment.orderId,
        shipmentId: shipment.id,
        status: nextStatus,
        userId: payment.customerId,
      };
    }

    return { updated, shipmentNotification };
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  });

  auditLog('PAYMENT_APPROVED', {
    paymentId,
    orderId: payment.orderId,
    customerId: payment.customerId,
    reviewerId,
    reviewerRole: reviewerRole ?? 'unknown',
    amount: payment.amount,
    items: payment.order.items.map((item) => ({
      productId: item.product.id,
      productTitle: item.product.title,
      quantity: item.quantity,
    })),
    note: data.note || null,
  });

  return {
    msg: "Pago aprobado exitosamente",
    data: approvedPayment.updated,
    shipmentNotification: approvedPayment.shipmentNotification,
  };
};
