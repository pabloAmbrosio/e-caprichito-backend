import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fp from 'fastify-plugin';
import { OAuth2Namespace } from '@fastify/oauth2';
import { env } from '../config/env';

const auth = async (fastify: FastifyInstance) => {

  fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign : {
      expiresIn : env.JWT_EXPIRES_IN
    }
  });

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.status(401).send({ error: 'UNAUTHORIZED', message: 'No autorizado' });
    }
  });

  fastify.decorate('authenticateOptional', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      // Token ausente o inválido → request.user queda undefined, no se bloquea
    }
  });

  fastify.decorate('requirePhoneVerified', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({
        error: 'USER_NOT_AUTHENTICATED',
        message: 'Usuario no autenticado'
      });
    }
    if (!request.user.phoneVerified) {
      return reply.status(403).send({
        error: 'PHONE_NOT_VERIFIED',
        message: 'Se requiere teléfono verificado para realizar esta acción'
      });
    }
  });
};

export const authPlugin = fp(auth);

declare module "fastify" {
  interface FastifyInstance {
    googleOAuth2: OAuth2Namespace;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authenticateOptional: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requirePhoneVerified: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      userId: string;
      username: string;
      phone: string | null;
      email: string | null;
      adminRole: string;
      customerRole: string | null;
      phoneVerified: boolean;
    };
    user: {
      userId: string;
      username: string;
      phone: string | null;
      email: string | null;
      adminRole: string;
      customerRole: string | null;
      phoneVerified: boolean;
    };
  }
}
