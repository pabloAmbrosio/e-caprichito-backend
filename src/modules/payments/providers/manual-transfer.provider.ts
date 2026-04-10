import * as v from 'valibot';
import { db as defaultDb } from '../../../lib/prisma';
import { PaymentProvider } from './payment-provider.interface';
import { ProviderResult, VerificationResult } from '../types';
import { InvalidProofDataError } from '../errors';
import { ALLOWED_PROOF_DOMAINS, BANK_REFERENCE_REGEX } from '../constants';

export const ManualTransferProofDataSchema = v.object({
  screenshotUrl: v.pipe(
    v.string('screenshotUrl debe ser texto'),
    v.url('screenshotUrl no es una URL válida'),
    v.check((url) => {
      try {
        const parsedUrl = new URL(url);
        return (ALLOWED_PROOF_DOMAINS as readonly string[]).includes(parsedUrl.hostname);
      } catch {
        return false;
      }
    }, 'La URL del comprobante no pertenece a un dominio permitido')
  ),
  bankReference: v.optional(
    v.pipe(
      v.string('bankReference debe ser texto'),
      v.trim(),
      v.maxLength(100, 'bankReference no puede exceder 100 caracteres'),
      v.regex(BANK_REFERENCE_REGEX, 'bankReference contiene caracteres no permitidos')
    )
  ),
});

export type ManualTransferProofData = v.InferOutput<typeof ManualTransferProofDataSchema>;

export const createManualTransferProvider = (dbClient = defaultDb): PaymentProvider => ({
  async initiate(_orderId: string, _amount: number): Promise<ProviderResult> {
    return {
      providerData: null,
      externalId: null,
    };
  },

  async processProof(paymentId: string, data: unknown): Promise<void> {
    const parseResult = v.safeParse(ManualTransferProofDataSchema, data);

    if (!parseResult.success) {
      const firstIssue = parseResult.issues[0];
      throw new InvalidProofDataError(firstIssue?.message ?? 'Estructura de datos inválida');
    }

    const proofData = parseResult.output;

    await dbClient.payment.update({
      where: { id: paymentId },
      data: {
        providerData: {
          screenshotUrl: proofData.screenshotUrl,
          ...(proofData.bankReference && { bankReference: proofData.bankReference }),
        },
        status: 'AWAITING_REVIEW',
      },
    });
  },

  // Manual transfers always require staff review — no automated verification possible
  async verify(_paymentId: string): Promise<VerificationResult> {
    return {
      requiresManualReview: true,
      verified: false,
      status: 'AWAITING_REVIEW',
    };
  },
});

export const manualTransferProvider = createManualTransferProvider();
