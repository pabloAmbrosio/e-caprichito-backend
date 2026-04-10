import { FastifyReply } from "fastify";
import { PromotionError, PromotionErrorHandler } from "../promotion.error-class";

export class ActionNotFoundError extends PromotionError {
    constructor() {
        super(404, "Accion no encontrada", "ACTION_NOT_FOUND");
    }
}

export class ActionNotFoundErrorHandler implements PromotionErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof ActionNotFoundError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }
}
