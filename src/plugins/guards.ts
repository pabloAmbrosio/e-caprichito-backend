import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { AdminRole } from '../lib/roles';

const guards = async (fastify: FastifyInstance) => {

  fastify.decorate('requireRoles', (allowedRoles: AdminRole[]) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      
      const userRole = request.user.adminRole as AdminRole;

      if (!allowedRoles.includes(userRole)) {
        return reply.status(403).send({
          error: 'INSUFFICIENT_PERMISSIONS',
          message: 'No tienes permisos para realizar esta acción',
        });
      }
    };
  });
};

export const guardsPlugin = fp(guards);

declare module 'fastify' {
  interface FastifyInstance {
    requireRoles: (roles: AdminRole[]) => (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
