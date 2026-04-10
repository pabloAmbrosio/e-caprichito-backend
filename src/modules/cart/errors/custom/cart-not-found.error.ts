import { FastifyReply, FastifyRequest } from 'fastify';
import { CartError, CartErrorHandler } from '../cart.error';

export class CartNotFoundError extends CartError {
    constructor(cartId: string) {
        super(404, `Carrito "${cartId}" no encontrado`, 'CART_NOT_FOUND');
    }
}

export class CartNotFoundErrorHandler implements CartErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof CartNotFoundError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
