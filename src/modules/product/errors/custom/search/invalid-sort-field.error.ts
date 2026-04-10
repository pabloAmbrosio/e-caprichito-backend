import { FastifyReply, FastifyRequest } from 'fastify';
import { ProductError, ProductErrorHandler } from '../../product.error';

export class InvalidSortFieldError extends ProductError {
    constructor(field: string) {
        super(400, `El campo de ordenamiento "${field}" no está permitido`, 'INVALID_SORT_FIELD');
    }
}

export class InvalidSortFieldErrorHandler implements ProductErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof InvalidSortFieldError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
