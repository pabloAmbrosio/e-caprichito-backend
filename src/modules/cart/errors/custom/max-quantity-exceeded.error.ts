import { FastifyReply, FastifyRequest } from 'fastify';
import { CartError, CartErrorHandler } from '../cart.error';

export class MaxQuantityExceededError extends CartError {
    constructor(maxQuantity: number) {
        super(400, `La cantidad máxima permitida por producto es ${maxQuantity}`, 'MAX_QUANTITY_EXCEEDED');
    }
}

export class MaxQuantityExceededErrorHandler implements CartErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof MaxQuantityExceededError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
