import { db as defaultDb } from '../../../../lib/prisma';
import { Prisma } from '../../../../lib/prisma';
import { getProvider } from '../../providers';
import { paymentSelect } from '../../payment.selects';
import { UploadProofBody } from '../../schemas';
import {
  PaymentNotFoundError,
  PaymentNotOwnedError,
  PaymentNotPendingError,
  PaymentError,
} from '../../errors';

export const uploadProof = async (paymentId: string, data: UploadProofBody, userId: string, dbClient = defaultDb) => {
  try {
    const result = await dbClient.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new PaymentNotFoundError(paymentId);
      }

      if (payment.customerId !== userId) {
        throw new PaymentNotOwnedError();
      }

      if (payment.status !== 'PENDING') {
        throw new PaymentNotPendingError();
      }

      const provider = getProvider(payment.method);
      await provider.processProof(paymentId, data);

      const updatedPayment = await tx.payment.findUnique({
        where: { id: paymentId },
        select: paymentSelect,
      });

      return updatedPayment;
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });

    return { msg: "Comprobante subido. Tu pago esta en revision.", data: result };
  } catch (error) {
    if (error instanceof PaymentError) {
      throw error;
    }

    console.error('[UploadProof] Error de base de datos:', error);
    throw new PaymentError(
      500,
      'Error interno al procesar el comprobante de pago. Intenta de nuevo.',
      'UPLOAD_PROOF_DB_ERROR'
    );
  }
};
