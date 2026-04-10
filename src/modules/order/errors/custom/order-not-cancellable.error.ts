import { FastifyReply } from "fastify";
import { OrderError, OrderErrorHandler } from "../order.error-class";

export class OrderNotCancellableError extends OrderError {
    constructor(status: string) {
        super(409, `No se puede cancelar una orden en estado "${status}"`, "ORDER_NOT_CANCELLABLE");
    }
}

export class OrderNotCancellableErrorHandler implements OrderErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof OrderNotCancellableError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
