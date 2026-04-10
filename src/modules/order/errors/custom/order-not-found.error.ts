import { FastifyReply } from "fastify";
import { OrderError, OrderErrorHandler } from "../order.error-class";

export class OrderNotFoundError extends OrderError {
    constructor(orderId: string) {
        super(404, `Orden "${orderId}" no encontrada`, "ORDER_NOT_FOUND");
    }
}

export class OrderNotFoundErrorHandler implements OrderErrorHandler {
    handle(error: unknown, reply: FastifyReply): FastifyReply | void {
        if (!(error instanceof OrderNotFoundError)) return;

        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message
        });
    }
}
