import { ProviderResult, VerificationResult } from '../types';

export interface PaymentProvider {
  initiate(orderId: string, amount: number): Promise<ProviderResult>;
  processProof(paymentId: string, data: unknown): Promise<void>;
  verify(paymentId: string): Promise<VerificationResult>;
}
