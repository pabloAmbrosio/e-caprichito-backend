import { FastifyReply, FastifyRequest } from 'fastify';
import { CartError, CartErrorHandler } from '../cart.error';

export class InsufficientStockError extends CartError {
    constructor(productId: string, requested: number, available: number) {
        super(409, `Stock insuficiente para "${productId}": solicitado ${requested}, disponible ${available}`, 'INSUFFICIENT_STOCK');
    }
}

export class InsufficientStockErrorHandler implements CartErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof InsufficientStockError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
