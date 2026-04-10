import { FastifyReply } from "fastify";
import { PromotionError, PromotionErrorHandler } from "../promotion.error-class";

export class PromotionExpiredError extends PromotionError {
    constructor() {
        super(400, "La promocion ha expirado", "PROMOTION_EXPIRED");
    }
}

export class PromotionExpiredErrorHandler implements PromotionErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof PromotionExpiredError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
