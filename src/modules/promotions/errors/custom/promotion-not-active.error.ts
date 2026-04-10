import { FastifyReply } from "fastify";
import { PromotionError, PromotionErrorHandler } from "../promotion.error-class";

export class PromotionNotActiveError extends PromotionError {
    constructor() {
        super(400, "La promocion no esta activa", "PROMOTION_NOT_ACTIVE");
    }
}

export class PromotionNotActiveErrorHandler implements PromotionErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof PromotionNotActiveError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
