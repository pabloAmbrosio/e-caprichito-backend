import { FastifyReply, FastifyRequest } from 'fastify';
import { ProductError, ProductErrorHandler } from '../../product.error';

export class ProductNotFoundError extends ProductError {
    constructor() {
        super(404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
    }
}

export class ProductNotFoundErrorHandler implements ProductErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof ProductNotFoundError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
