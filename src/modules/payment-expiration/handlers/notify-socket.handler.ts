import { Server } from 'socket.io';
import { PaymentExpirationHandler, ExpiredPaymentData } from '../registry/expiration-handler.interface';

export class NotifyPaymentExpiredHandler implements PaymentExpirationHandler {
  name = 'NotifyPaymentExpiredHandler';

  constructor(private io: Server) {}

  async execute(payment: ExpiredPaymentData): Promise<void> {
    this.io.to(`user:${payment.customerId}`).emit('payment:expired', {
      paymentId: payment.id,
      orderId: payment.orderId,
      message: 'Tu pago ha expirado por falta de comprobante. Puedes crear un nuevo pago.',
    });
  }
}
