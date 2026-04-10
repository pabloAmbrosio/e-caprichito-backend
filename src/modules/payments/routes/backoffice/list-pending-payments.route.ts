import { FastifyInstance } from 'fastify';
import { ListPaymentsQuerySchema } from '../../schemas';
import { listPendingPaymentsHandler } from '../../handlers';
import { PAYMENT_URL } from '../../constants';
import { PAYMENT_RATE_LIMIT } from '../../../../config/rate-limit.config';

export default async (fastify: FastifyInstance) => {
  fastify.get(PAYMENT_URL, {
    preHandler: [
      fastify.authenticate,
      fastify.requireRoles(['OWNER', 'ADMIN']),
    ],
    schema: {
      querystring: ListPaymentsQuerySchema,
    },
    config: { rateLimit: PAYMENT_RATE_LIMIT },
    handler: listPendingPaymentsHandler,
  });
};
