import { FastifyReply, FastifyRequest } from 'fastify';
import { ProductError, ProductErrorHandler } from '../../product.error';

export class InvalidSortDirectionError extends ProductError {
    constructor(direction: string) {
        super(400, `La dirección de ordenamiento "${direction}" no está permitida`, 'INVALID_SORT_DIRECTION');
    }
}

export class InvalidSortDirectionErrorHandler implements ProductErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof InvalidSortDirectionError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
