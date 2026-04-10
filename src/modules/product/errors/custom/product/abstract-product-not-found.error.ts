import { FastifyReply, FastifyRequest } from 'fastify';
import { ProductError, ProductErrorHandler } from '../../product.error';

export class AbstractProductNotFoundError extends ProductError {
    constructor() {
        super(404, 'Producto abstracto no encontrado', 'ABSTRACT_PRODUCT_NOT_FOUND');
    }
}

export class AbstractProductNotFoundErrorHandler implements ProductErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof AbstractProductNotFoundError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
