import { FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';
import fp from 'fastify-plugin';
import { env } from '../config/env';

const cookieConfig = async (fastify: FastifyInstance) => {
  
  const cookieSecret = env.COOKIE_SECRET;

  fastify.register(cookie, {
    secret: cookieSecret,
    parseOptions: {}
  });
};

export const cookiePlugin = fp(cookieConfig);
