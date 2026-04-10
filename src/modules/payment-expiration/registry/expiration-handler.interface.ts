export interface ExpiredPaymentData {
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  method: string;
  createdAt: Date;
}

export interface PaymentExpirationHandler {
  name: string;
  execute(payment: ExpiredPaymentData): Promise<void>;
}
