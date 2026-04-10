import { FastifyReply } from "fastify";
import { PromotionError, PromotionErrorHandler } from "../promotion.error-class";

export class CouponNotFoundError extends PromotionError {
    constructor() {
        super(400, "Cupon no encontrado o no valido", "COUPON_NOT_FOUND");
    }
}

export class CouponNotFoundErrorHandler implements PromotionErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof CouponNotFoundError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
