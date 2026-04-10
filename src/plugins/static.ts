import { FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import fp from 'fastify-plugin';
import path from 'path';
import { env } from '../config/env';

const staticFiles = async (fastify: FastifyInstance) => {
  if (env.NODE_ENV === 'production') {
    fastify.log.info('[STATIC] Archivos estáticos deshabilitados en producción.');
    return;
  }

  fastify.register(fastifyStatic, {
    root: path.join(__dirname, '../../public'),
    prefix: '/public/',
  });

  fastify.log.info('[STATIC] Sirviendo archivos estáticos desde /public/');
};

export const staticPlugin = fp(staticFiles);
