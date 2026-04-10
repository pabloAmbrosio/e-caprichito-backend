import { FastifyInstance } from 'fastify';
import { UploadProofParamsSchema, UploadProofBodySchema } from '../../schemas';
import { uploadProofHandler } from '../../handlers';
import { PAYMENT_URL } from '../../constants';
import { PAYMENT_RATE_LIMIT } from '../../../../config/rate-limit.config';

export default async (fastify: FastifyInstance) => {
  fastify.patch(`${PAYMENT_URL}/:id/proof`, {
    preHandler: [fastify.authenticate],
    schema: {
      params: UploadProofParamsSchema,
      body: UploadProofBodySchema,
    },
    config: { rateLimit: PAYMENT_RATE_LIMIT },
    handler: uploadProofHandler,
  });
};
