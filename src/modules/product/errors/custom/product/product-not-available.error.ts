import { FastifyReply, FastifyRequest } from 'fastify';
import { ProductError, ProductErrorHandler } from '../../product.error';

export class ProductNotAvailableError extends ProductError {
    constructor() {
        super(400, 'El producto abstracto no esta disponible para crear variantes', 'PRODUCT_NOT_AVAILABLE');
    }
}

export class ProductNotAvailableErrorHandler implements ProductErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof ProductNotAvailableError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
