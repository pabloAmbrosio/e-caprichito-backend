import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import { FastifyInstance } from 'fastify';
import { getAllowedOrigins } from '../config/cors.config';

/**
 * CORS controlado por env vars (FRONTEND_URL + ALLOWED_ORIGINS).
 *
 * - Producción: solo los orígenes explícitos; si la lista queda vacía se
 *   bloquean todos (fail-closed).
 * - Desarrollo: misma lista de orígenes — no se relaja a wildcard para
 *   detectar problemas de CORS antes de llegar a producción.
 */
const corsPlugin = async (fastify: FastifyInstance) => {
  const origins = getAllowedOrigins();

  await fastify.register(cors, {
    origin: origins.length > 0 ? origins : false,
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
