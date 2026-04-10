import { FastifyReply, FastifyRequest } from 'fastify';
import { CartError, CartErrorHandler } from '../cart.error';

export class OutOfStockError extends CartError {
    constructor(productId: string) {
        super(409, `El producto "${productId}" está agotado`, 'OUT_OF_STOCK');
    }
}

export class OutOfStockErrorHandler implements CartErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof OutOfStockError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
