import { FastifyInstance } from 'fastify';
import oauth2 from '@fastify/oauth2';
import fp from 'fastify-plugin';
import { env } from '../config/env';

const oauth = async (fastify: FastifyInstance) => {
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  const callbackPath = env.GOOGLE_CALLBACK_URL;
  const base = env.BASE_URL || `http://localhost:${env.PORT}`;
  const callbackUri = `${base}${callbackPath}`;

  if (!clientId || !clientSecret) {
    fastify.log.warn(
      '[OAUTH] GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET no definidos. ' +
      'El login con Google no funcionara.'
    );
  }

  fastify.register(oauth2, {
    name: 'googleOAuth2',
    credentials: {
      client: {
        id: clientId || '',
        secret: clientSecret || ''
      },
      auth: oauth2.GOOGLE_CONFIGURATION
    },
    startRedirectPath: '/api/auth/google',
    callbackUri,
    scope: ['profile', 'email']
  });
};

export const oauthPlugin = fp(oauth);
