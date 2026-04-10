import { FastifyRequest, FastifyReply } from 'fastify';

export const googleLoginHandler = async (_request: FastifyRequest, reply: FastifyReply) => {
  return reply.send({
    success: true,
    msg: "Redirigiendo a Google..."
  });
};
