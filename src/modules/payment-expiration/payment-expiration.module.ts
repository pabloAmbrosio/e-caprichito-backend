import { Server } from 'socket.io';
import { PaymentExpirationRegistry } from './registry/expiration-registry';
import { ExpirePaymentHandler } from './handlers/expire-payment.handler';
import { NotifyPaymentExpiredHandler } from './handlers/notify-socket.handler';
import { PaymentAuditLogHandler } from './handlers/audit-log.handler';
import { startPaymentExpirationJob } from './jobs/payment-expiration.job';
import { PAYMENT_EXPIRATION } from '../payments/constants';

export const initPaymentExpiration = (io: Server) => {
  const registry = new PaymentExpirationRegistry();

  // Order matters: expire first, then notify, then audit
  registry.register(new ExpirePaymentHandler());
  registry.register(new NotifyPaymentExpiredHandler(io));
  registry.register(new PaymentAuditLogHandler());

  const interval = process.env.PAYMENT_CRON_INTERVAL || PAYMENT_EXPIRATION.CRON_INTERVAL;
  startPaymentExpirationJob(registry, interval);
};
