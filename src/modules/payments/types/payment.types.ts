export interface ProviderResult {
  providerData: Record<string, unknown> | null;
  externalId: string | null;
}

export interface VerificationResult {
  requiresManualReview: boolean;
  verified: boolean;
  status: 'APPROVED' | 'REJECTED' | 'AWAITING_REVIEW';
}

// For MANUAL_TRANSFER: { screenshotUrl, bankReference? }. Other providers may differ.
export interface ManualTransferProofData {
  screenshotUrl: string;
  bankReference?: string;
}
