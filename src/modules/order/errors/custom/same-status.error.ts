import { FastifyReply } from "fastify";
import { OrderError, OrderErrorHandler } from "../order.error-class";

export class SameStatusError extends OrderError {
    constructor(status: string) {
        super(422, `La orden ya esta en estado "${status}"`, "SAME_STATUS");
    }
}

export class SameStatusErrorHandler implements OrderErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof SameStatusError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
