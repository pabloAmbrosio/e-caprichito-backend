import { FastifyReply, FastifyRequest } from 'fastify';
import { CartError, CartErrorHandler } from '../cart.error';

export class ProductNotFoundError extends CartError {
    constructor(productId: string) {
        super(404, `Producto "${productId}" no existe`, 'PRODUCT_NOT_FOUND');
    }
}

export class ProductNotFoundErrorHandler implements CartErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof ProductNotFoundError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
