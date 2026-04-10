import { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import fp from 'fastify-plugin';
import { env } from '../config/env';

const rateLimiter = async (fastify: FastifyInstance) => {
  fastify.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW
  });
};

export const rateLimitPlugin = fp(rateLimiter);
