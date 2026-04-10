import { FastifyReply } from "fastify";
import { PromotionError, PromotionErrorHandler } from "../promotion.error-class";

export class RuleNotFoundError extends PromotionError {
    constructor() {
        super(404, "Regla no encontrada", "RULE_NOT_FOUND");
    }
}

export class RuleNotFoundErrorHandler implements PromotionErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof RuleNotFoundError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
