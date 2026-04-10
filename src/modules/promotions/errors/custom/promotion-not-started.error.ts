import { FastifyReply } from "fastify";
import { PromotionError, PromotionErrorHandler } from "../promotion.error-class";

export class PromotionNotStartedError extends PromotionError {
    constructor() {
        super(400, "La promocion aun no ha comenzado", "PROMOTION_NOT_STARTED");
    }
}

export class PromotionNotStartedErrorHandler implements PromotionErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof PromotionNotStartedError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
