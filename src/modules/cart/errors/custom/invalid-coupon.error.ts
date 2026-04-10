import { FastifyReply, FastifyRequest } from 'fastify';
import { CartError, CartErrorHandler } from '../cart.error';

export class InvalidCouponError extends CartError {
    constructor(couponCode: string) {
        super(400, `Cupon "${couponCode}" no valido`, 'INVALID_COUPON');
    }
}

export class InvalidCouponErrorHandler implements CartErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof InvalidCouponError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
