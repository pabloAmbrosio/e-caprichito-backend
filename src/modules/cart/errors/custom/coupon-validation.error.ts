import { FastifyReply, FastifyRequest } from 'fastify';
import { CartErrorHandler } from '../cart.error';
import { COUPON_ERRORS } from '../../adapters/promotion.adapter';

export class CouponValidationErrorHandler implements CartErrorHandler {
    handle(error: unknown, reply: FastifyReply, _request: FastifyRequest, _context: string): FastifyReply | void {
        if (!(error instanceof Error)) return;

        const isCouponError = (COUPON_ERRORS as readonly string[]).includes(error.message);
        if (!isCouponError) return;

        return reply.status(400).send({
            error: 'COUPON_VALIDATION_ERROR',
            message: error.message
        });
    }
}
