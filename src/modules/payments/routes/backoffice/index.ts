import { FastifyInstance } from 'fastify';

import listPendingPaymentsRoute from './list-pending-payments.route';
import getPaymentDetailRoute from './get-payment-detail.route';
import reviewPaymentRoute from './review-payment.route';

export const backofficePaymentRoutes = async (fastify: FastifyInstance) => {
  fastify.register(listPendingPaymentsRoute);
  fastify.register(getPaymentDetailRoute);
  fastify.register(reviewPaymentRoute);
};
