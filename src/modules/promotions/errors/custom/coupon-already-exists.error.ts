import { FastifyReply } from "fastify";
import { PromotionError, PromotionErrorHandler } from "../promotion.error-class";

export class CouponAlreadyExistsError extends PromotionError {
    constructor() {
        super(409, "Ya existe una promocion con ese codigo de cupon", "COUPON_ALREADY_EXISTS");
    }
}

export class CouponAlreadyExistsErrorHandler implements PromotionErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof CouponAlreadyExistsError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
