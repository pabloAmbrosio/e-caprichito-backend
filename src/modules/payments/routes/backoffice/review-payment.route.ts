import { FastifyInstance } from 'fastify';
import { ReviewPaymentParamsSchema, ReviewPaymentBodySchema } from '../../schemas';
import { reviewPaymentHandler } from '../../handlers';
import { PAYMENT_URL } from '../../constants';
import { PAYMENT_RATE_LIMIT } from '../../../../config/rate-limit.config';

export default async (fastify: FastifyInstance) => {
  fastify.patch(`${PAYMENT_URL}/:id/review`, {
    preHandler: [
      fastify.authenticate,
      fastify.requireRoles(['OWNER', 'ADMIN']),
    ],
    schema: {
      params: ReviewPaymentParamsSchema,
      body: ReviewPaymentBodySchema,
    },
    config: { rateLimit: PAYMENT_RATE_LIMIT },
    handler: reviewPaymentHandler,
  });
};
