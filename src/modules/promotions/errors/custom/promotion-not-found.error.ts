import { FastifyReply } from "fastify";
import { PromotionError, PromotionErrorHandler } from "../promotion.error-class";

export class PromotionNotFoundError extends PromotionError {
    constructor() {
        super(404, "Promocion no encontrada", "PROMOTION_NOT_FOUND");
    }
}

export class PromotionNotFoundErrorHandler implements PromotionErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof PromotionNotFoundError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
