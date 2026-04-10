import { FastifyReply } from "fastify";
import { PromotionError, PromotionErrorHandler } from "../promotion.error-class";

export class MaxUsesReachedError extends PromotionError {
    constructor() {
        super(400, "Has alcanzado el limite de usos para esta promocion", "MAX_USES_REACHED");
    }
}

export class MaxUsesReachedErrorHandler implements PromotionErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof MaxUsesReachedError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
