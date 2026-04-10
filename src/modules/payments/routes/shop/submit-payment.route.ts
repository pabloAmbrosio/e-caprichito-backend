import { FastifyInstance } from 'fastify';
import { SubmitPaymentSchema } from '../../schemas';
import { submitPaymentHandler } from '../../handlers';
import { PAYMENT_URL } from '../../constants';
import { PAYMENT_RATE_LIMIT } from '../../../../config/rate-limit.config';

export default async (fastify: FastifyInstance) => {
  fastify.post(PAYMENT_URL, {
    preHandler: [fastify.authenticate],
    schema: { body: SubmitPaymentSchema },
    config: { rateLimit: PAYMENT_RATE_LIMIT },
    handler: submitPaymentHandler,
  });
};
