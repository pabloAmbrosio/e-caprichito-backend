import { FastifyReply, FastifyRequest } from 'fastify';
import { ProductError, ProductErrorHandler } from '../../product.error';

export class InvalidStatusTransitionError extends ProductError {
    constructor(from: string, to: string, allowed: string[]) {
        super(
            400,
            `Transicion de status invalida: ${from} -> ${to}. Transiciones permitidas: ${allowed.join(', ') || 'ninguna'}`,
            'INVALID_STATUS_TRANSITION'
        );
    }
}

export class InvalidStatusTransitionErrorHandler implements ProductErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof InvalidStatusTransitionError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
