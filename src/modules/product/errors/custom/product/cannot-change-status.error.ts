import { FastifyReply, FastifyRequest } from 'fastify';
import { ProductError, ProductErrorHandler } from '../../product.error';

export class CannotChangeStatusError extends ProductError {
    constructor() {
        super(403, 'No tienes permisos para cambiar el status del producto', 'CANNOT_CHANGE_STATUS');
    }
}

export class CannotChangeStatusErrorHandler implements ProductErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof CannotChangeStatusError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
