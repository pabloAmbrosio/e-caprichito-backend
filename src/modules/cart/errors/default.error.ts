import { FastifyReply, FastifyRequest } from 'fastify';
import { CartErrorHandler } from './cart.error';

export class DefaultCartErrorHandler implements CartErrorHandler {
    handle(error: unknown, reply: FastifyReply, request: FastifyRequest, context: string): FastifyReply | void {
        request.log.error(error, `Error interno: ${context}`);
        return reply.status(500).send({
            error: 'INTERNAL_ERROR',
            message: `Error interno al ${context}`
        });
    }
}
