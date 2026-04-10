import { FastifyReply, FastifyRequest } from 'fastify';
import { CartError, CartErrorHandler } from '../cart.error';

export class MaxItemsExceededError extends CartError {
    constructor(maxItems: number) {
        super(400, `El carrito no puede tener más de ${maxItems} productos distintos`, 'MAX_ITEMS_EXCEEDED');
    }
}

export class MaxItemsExceededErrorHandler implements CartErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof MaxItemsExceededError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
