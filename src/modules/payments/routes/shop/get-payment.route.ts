import { FastifyInstance } from 'fastify';
import { PaymentIdSchema } from '../../schemas';
import { getPaymentHandler } from '../../handlers';
import { PAYMENT_URL } from '../../constants';
import { PAYMENT_RATE_LIMIT } from '../../../../config/rate-limit.config';

export default async (fastify: FastifyInstance) => {
  fastify.get(`${PAYMENT_URL}/:id`, {
    preHandler: [fastify.authenticate],
    schema: { params: PaymentIdSchema },
    config: { rateLimit: PAYMENT_RATE_LIMIT },
    handler: getPaymentHandler,
  });
};
