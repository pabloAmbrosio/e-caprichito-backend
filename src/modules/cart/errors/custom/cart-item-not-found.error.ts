import { FastifyReply, FastifyRequest } from 'fastify';
import { CartError, CartErrorHandler } from '../cart.error';

export class CartItemNotFoundError extends CartError {
    constructor(productId: string) {
        super(404, `Producto "${productId}" no encontrado en el carrito`, 'CART_ITEM_NOT_FOUND');
    }
}

export class CartItemNotFoundErrorHandler implements CartErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof CartItemNotFoundError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
