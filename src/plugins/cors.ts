import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import { FastifyInstance } from 'fastify';
import { env } from '../config/env';
import { getAllowedOrigins } from '../config/cors.config';

const corsPlugin = async (fastify: FastifyInstance) => {
  const isProduction = env.NODE_ENV === 'production';
  const origins = getAllowedOrigins();

  await fastify.register(cors, {
    origin: isProduction
      ? origins.length > 0 ? origins : false
      : env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Cache-Control',
      'X-CSRF-Token',
    ],
  });
};

export default fp(corsPlugin);
