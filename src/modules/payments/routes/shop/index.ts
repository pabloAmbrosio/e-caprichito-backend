import { FastifyInstance } from 'fastify';

import submitPaymentRoute from './submit-payment.route';
import uploadProofRoute from './upload-proof.route';
import getPaymentRoute from './get-payment.route';
import listMyPaymentsRoute from './list-my-payments.route';

export const shopPaymentRoutes = async (fastify: FastifyInstance) => {
  fastify.register(submitPaymentRoute);
  fastify.register(uploadProofRoute);
  fastify.register(getPaymentRoute);
  fastify.register(listMyPaymentsRoute);
};
