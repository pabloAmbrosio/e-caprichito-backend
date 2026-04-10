import { PaymentMethod } from '../../../lib/prisma';
import { PaymentProvider } from './payment-provider.interface';
import { manualTransferProvider } from './manual-transfer.provider';
import { cashOnDeliveryProvider } from './cash-on-delivery.provider';

const providerRegistry = new Map<PaymentMethod, PaymentProvider>();

providerRegistry.set('MANUAL_TRANSFER', manualTransferProvider);
providerRegistry.set('CASH_ON_DELIVERY', cashOnDeliveryProvider);

export const getProvider = (method: PaymentMethod): PaymentProvider => {
  const provider = providerRegistry.get(method);

  if (!provider) {
    throw new Error(`Método de pago no soportado: ${method}`);
  }

  return provider;
};

export { PaymentProvider } from './payment-provider.interface';
export { manualTransferProvider } from './manual-transfer.provider';
export { cashOnDeliveryProvider } from './cash-on-delivery.provider';
