import { FastifyReply } from "fastify";
import { OrderError, OrderErrorHandler } from "../order.error-class";

export class InvalidStatusTransitionError extends OrderError {
    constructor(currentStatus: string, targetStatus: string) {
        super(
            400,
            `No se puede cambiar de "${currentStatus}" a "${targetStatus}"`,
            "INVALID_STATUS_TRANSITION"
        );
    }
}

export class InvalidStatusTransitionErrorHandler implements OrderErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof InvalidStatusTransitionError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
