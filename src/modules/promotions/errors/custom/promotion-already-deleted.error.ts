import { FastifyReply } from "fastify";
import { PromotionError, PromotionErrorHandler } from "../promotion.error-class";

export class PromotionAlreadyDeletedError extends PromotionError {
    constructor() {
        super(400, "La promocion ya fue eliminada", "PROMOTION_ALREADY_DELETED");
    }
}

export class PromotionAlreadyDeletedErrorHandler implements PromotionErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof PromotionAlreadyDeletedError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
