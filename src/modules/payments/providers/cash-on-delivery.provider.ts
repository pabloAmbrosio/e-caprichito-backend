import { PaymentProvider } from './payment-provider.interface';
import { ProviderResult, VerificationResult } from '../types';
import { CodProofNotAllowedError } from '../errors';

export const createCashOnDeliveryProvider = (): PaymentProvider => ({
  async initiate(_orderId: string, _amount: number): Promise<ProviderResult> {
    return {
      providerData: { type: 'CASH_ON_DELIVERY' },
      externalId: null,
    };
  },

  async processProof(_paymentId: string, _data: unknown): Promise<void> {
    throw new CodProofNotAllowedError();
  },

  async verify(_paymentId: string): Promise<VerificationResult> {
    return {
      requiresManualReview: false,
      verified: false,
      status: 'AWAITING_REVIEW',
    };
  },
});

export const cashOnDeliveryProvider = createCashOnDeliveryProvider();
