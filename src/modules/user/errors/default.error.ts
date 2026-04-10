import { FastifyReply, FastifyRequest } from 'fastify';
import { UserErrorHandler } from './user.error';

export class DefaultUserErrorHandler implements UserErrorHandler {
    handle(error: unknown, reply: FastifyReply, request: FastifyRequest, context: string): FastifyReply | void {
        request.log.error(error, `Error interno: ${context}`);
        return reply.status(500).send({
            error: 'INTERNAL_ERROR',
            message: `Error interno al ${context}`
        });
    }
}
